"""
Whisper API Routes
------------------
Routes for video transcription and subtitle translation using OpenAI Whisper and GPT-5 nano.
"""

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from pathlib import Path
import os
import subprocess
import tempfile
from openai import OpenAI
from whisper_chunked import transcribe_audio_chunked, get_audio_duration, should_use_chunking, fill_music_gaps
import uuid
from progress_tracker import create_progress, update_progress, get_progress, complete_progress, error_progress
from hallucination_filter import filter_hallucinations

whisper_bp = Blueprint('whisper', __name__)

# Initialize OpenAI client (for Whisper and GPT-5 nano translation)
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Configuration
UPLOAD_FOLDER = Path('uploads')
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm', 'mp3', 'wav', 'm4a'}


@whisper_bp.route('/api/progress/<job_id>', methods=['GET'])
def get_transcription_progress(job_id):
    """Get progress of a transcription job."""
    progress = get_progress(job_id)
    if progress:
        return jsonify(progress)
    else:
        return jsonify({'error': 'Job not found'}), 404

def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_audio_ffmpeg(video_path, audio_path):
    """
    Extract audio from video using ffmpeg with precise timestamp handling.

    Args:
        video_path: Path to input video file
        audio_path: Path to output audio file

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Use M4A format (AAC codec) for Whisper API compatibility
        cmd = [
            'ffmpeg',
            '-i', str(video_path),
            '-map', '0:a:0',
            '-vn',
            '-acodec', 'aac',  # AAC codec in M4A container
            '-ar', '44100',     # Keep standard sample rate
            '-avoid_negative_ts', 'make_zero',
            '-y',
            str(audio_path)
        ]

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )

        return True
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error: {e.stderr}")
        return False
    except Exception as e:
        print(f"Error extracting audio: {str(e)}")
        return False


@whisper_bp.route('/api/transcribe', methods=['POST'])
def transcribe_video():
    """
    Transcribe video audio using OpenAI Whisper.

    Form data:
        - video: Video file
        - targetLanguage: Target language code (optional, default: 'en')
        - sourceLanguage: Source language code (optional, auto-detect if not provided)
        - culturalContext: Cultural context for transcription (optional)
        - tone: Desired tone (optional)

    Returns:
        JSON with subtitles and metadata
    """
    # Check if file is present
    if 'video' not in request.files:
        return jsonify({'error': 'No video file uploaded'}), 400

    file = request.files['video']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    # Create job ID for progress tracking
    job_id = str(uuid.uuid4())

    video_path = None
    audio_path = None
    audio_file = None

    try:
        # Initialize progress tracking
        create_progress(job_id, total_steps=100)
        update_progress(job_id, 0, 'Uploading video...', 'processing')

        # Save uploaded file
        filename = secure_filename(file.filename)
        video_path = UPLOAD_FOLDER / filename
        file.save(str(video_path))

        update_progress(job_id, 10, 'Extracting audio from video...', 'processing')

        # Create temporary audio file (use .m4a for Whisper API compatibility)
        audio_path = video_path.with_suffix('.m4a')

        print(f'Extracting audio from video...')
        success = extract_audio_ffmpeg(video_path, audio_path)

        if not success:
            error_progress(job_id, 'Failed to extract audio from video')
            return jsonify({'error': 'Failed to extract audio from video'}), 500

        update_progress(job_id, 20, 'Analyzing audio...', 'processing')

        print(f'Transcribing audio with Whisper...')

        # Get context settings
        target_language = request.form.get('targetLanguage', 'en')
        source_language = request.form.get('sourceLanguage', 'auto')
        cultural_context = request.form.get('culturalContext', '')
        tone = request.form.get('tone', '')

        # Check audio duration to decide on chunking
        duration = get_audio_duration(audio_path)
        use_chunking = should_use_chunking(duration, threshold=600)  # 10 minutes

        if use_chunking:
            print(f'Using chunked transcription for long video ({duration:.2f}s)')
            update_progress(job_id, 30, 'Transcribing audio (this may take a while for long videos)...', 'processing')

            # Prepare Whisper options
            whisper_options = {}
            if source_language and source_language not in ['auto', 'auto-detect']:
                whisper_options['language'] = source_language

            # Add context prompt to improve transcription quality
            if cultural_context:
                whisper_options['prompt'] = cultural_context

            # Use chunked transcription with progress tracking
            # Progress 30-90 will be handled by chunked transcription
            subtitles, detected_language = transcribe_audio_chunked(
                audio_path,
                chunk_duration=300,  # 5-minute chunks
                job_id=job_id,
                **whisper_options
            )

            update_progress(job_id, 90, 'Finalizing subtitles...', 'processing')

        else:
            print(f'Using standard transcription for short video ({duration:.2f}s)')
            update_progress(job_id, 30, 'Transcribing audio...', 'processing')

            # Open audio file for transcription
            audio_file = open(audio_path, 'rb')

            # Prepare Whisper API options
            transcription_options = {
                'file': audio_file,
                'model': 'whisper-1',
                'response_format': 'verbose_json',
                'timestamp_granularities': ['segment']
            }

            # Add language if source language is specified
            if source_language and source_language not in ['auto', 'auto-detect']:
                transcription_options['language'] = source_language

            # Add context prompt if provided
            if cultural_context:
                transcription_options['prompt'] = cultural_context

            # Call Whisper API
            transcription = client.audio.transcriptions.create(**transcription_options)

            update_progress(job_id, 80, 'Formatting subtitles...', 'processing')

            # Format the response into subtitles
            subtitles = []
            for index, segment in enumerate(transcription.segments):
                subtitles.append({
                    'id': index + 1,
                    'start': segment.start,
                    'end': segment.end,
                    'text': segment.text.strip()
                })

            detected_language = transcription.language

            # Fill gaps with music placeholders to maintain sync
            subtitles = fill_music_gaps(subtitles, duration, gap_threshold=3.0)

            update_progress(job_id, 90, 'Finalizing...', 'processing')

        print(f'Transcription complete: {len(subtitles)} subtitles generated (after filtering)')

        # Mark as complete
        complete_progress(job_id, 'Transcription complete!')

        return jsonify({
            'success': True,
            'jobId': job_id,
            'subtitles': subtitles,
            'metadata': {
                'duration': duration,
                'language': detected_language,
                'segmentCount': len(subtitles),
                'chunked': use_chunking
            }
        })

    except Exception as e:
        print(f'Transcription error: {str(e)}')
        error_progress(job_id, f'Error: {str(e)}')
        return jsonify({
            'error': 'Failed to transcribe video',
            'details': str(e)
        }), 500

    finally:
        # Close audio file handle if open
        if audio_file:
            try:
                audio_file.close()
            except:
                pass

        # Clean up uploaded files
        if video_path and video_path.exists():
            try:
                video_path.unlink()
            except:
                pass
        if audio_path and audio_path.exists():
            try:
                audio_path.unlink()
            except:
                pass


@whisper_bp.route('/api/translate', methods=['POST'])
def translate_subtitles():
    """
    Translate subtitles using OpenAI GPT.

    JSON body:
        - subtitles: Array of subtitle objects
        - targetLanguage: Target language code
        - sourceLanguage: Source language code (optional)
        - culturalContext: Cultural context (optional)
        - tone: Desired tone (optional)

    Returns:
        JSON with translated subtitles and metadata
    """
    try:
        data = request.get_json()

        subtitles = data.get('subtitles')
        target_language = data.get('targetLanguage')
        source_language = data.get('sourceLanguage')
        cultural_context = data.get('culturalContext', '')
        tone = data.get('tone', '')

        if not subtitles or not isinstance(subtitles, list):
            return jsonify({'error': 'Invalid subtitles data'}), 400

        if not target_language:
            return jsonify({'error': 'Target language is required'}), 400

        print(f'Translating {len(subtitles)} subtitles to {target_language}...')

        # Prepare subtitle text for translation
        subtitle_texts = '\n'.join([sub['text'] for sub in subtitles])

        # Language name mapping for better context
        language_names = {
            'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
            'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese', 'ar': 'Arabic',
            'hi': 'Hindi', 'pt': 'Portuguese'
        }

        target_lang_name = language_names.get(target_language, target_language)
        source_lang_name = language_names.get(source_language, 'the source language') if source_language else 'the source language'

        # Build context-aware prompt
        context_note = ''
        if cultural_context:
            context_note += f'\nCultural context: {cultural_context}'
        if tone:
            tone_descriptions = {
                'neutral': 'balanced and natural',
                'formal': 'polite and respectful',
                'casual': 'relaxed and friendly',
                'humorous': 'fun and engaging'
            }
            tone_desc = tone_descriptions.get(tone, tone)
            context_note += f'\nDesired tone: {tone_desc}'

        # Use GPT-5 nano for Singlish conversion/translation
        system_prompt = f"""You are an expert subtitle localizer. Your job is to convert/translate ALL subtitles to Singapore English (Singlish) style.

CRITICAL RULES:
- If input is in foreign language (Japanese/Chinese/etc): TRANSLATE EVERYTHING to ENGLISH first
- If input is already in English: CONVERT to Singlish style (add particles, change grammar)
- ALWAYS output in Singlish - even if source is already English
- NO Japanese words allowed in output
- NO Chinese characters allowed in output
- NO foreign language words in final output (except common Singlish terms like "makan", "shiok")
- Output language: ENGLISH ONLY with Singlish grammar
- Target style: Singapore English (Singlish)

Examples of CORRECT translation/conversion:

Foreign language to Singlish:
- "行くよ" → "I going lah" (NOT "I 行くよ lah")
- "ありがとう" → "Thank you sia" (NOT "ありがとう sia")
- "すごい" → "Wah so amazing!" (NOT "すごい lah")

English to Singlish conversion:
- "I'm going now" → "I go first lah"
- "Are you serious?" → "Serious or not?"
- "That's amazing!" → "Wah so shiok sia!"
- "I don't know" → "Don't know leh"
- "Can you help me?" → "Can help me or not?"
- "I'm leaving" → "I going already"

Natural Singapore English (Singlish) Style Guidelines:
- Use Singlish particles naturally: "lah", "leh", "lor", "meh", "sia", "hor", "ah"
- Drop articles when natural: "Go buy food", "Take MRT"
- Use "can" for agreement: "Can lah", "Can or not?"
- Use local expressions: "wah", "alamak", "aiyo", "steady lah", "shiok", "siao", "paiseh"
- Add "already" at end: "finish already", "done already"
- Question tags: "right or not?", "got or not?", "is it?"
- Relaxed grammar: "I go first", "He never come", "So expensive one"
- Emotional expressions: "Wah lau!", "Die lah!", "What sia!"

Translation/Conversion Approach:
- ALWAYS convert to Singlish - whether source is English or foreign language
- TRANSLATE COMPLETELY if foreign language - no original language text should remain
- CONVERT to Singlish style if already English - add particles, change grammar
- Make it sound like how Singaporeans naturally talk in ENGLISH
- Preserve character emotions and personality
- Keep subtitles concise and readable
- Maintain the same number of lines
{context_note}

Context: Convert ALL subtitles (English or foreign) to Singapore English for local audience. Every subtitle must be in Singlish style.

Output format: One fully Singlish subtitle per line (100% ENGLISH with Singlish style), without numbering or timestamps."""

        # Use GPT-5 nano for translation with minimal reasoning for speed
        # Note: GPT-5 nano only supports default temperature (1)
        completion = client.chat.completions.create(
            model='gpt-5-nano',
            messages=[
                {
                    'role': 'system',
                    'content': system_prompt
                },
                {
                    'role': 'user',
                    'content': subtitle_texts
                }
            ],
            reasoning_effort='minimal'  # Fastest reasoning level for speed
        )

        translated_text = completion.choices[0].message.content.strip()
        translated_lines = [line for line in translated_text.split('\n') if line.strip()]

        # Map translations back to subtitle objects
        translated_subtitles = []
        for index, sub in enumerate(subtitles):
            translated_subtitles.append({
                **sub,
                'text': translated_lines[index] if index < len(translated_lines) else sub['text']
            })

        print('Translation complete')

        return jsonify({
            'success': True,
            'subtitles': translated_subtitles,
            'metadata': {
                'sourceLanguage': source_language or 'auto',
                'targetLanguage': target_language,
                'subtitleCount': len(translated_subtitles)
            }
        })

    except Exception as e:
        print(f'Translation error: {str(e)}')
        return jsonify({
            'error': 'Failed to translate subtitles',
            'details': str(e)
        }), 500
