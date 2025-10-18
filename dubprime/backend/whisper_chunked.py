"""
Chunked Whisper Transcription
------------------------------
For long videos (>10 minutes), split audio into chunks to prevent sync drift.
"""

import subprocess
from pathlib import Path
import math
from openai import OpenAI
import os
from progress_tracker import update_progress, add_subtitles
from hallucination_filter import is_hallucination, detect_silence_hallucination

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))


def get_audio_duration(audio_path):
    """Get audio duration in seconds using ffprobe."""
    cmd = [
        'ffprobe',
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        str(audio_path)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return float(result.stdout.strip())


def split_audio_chunk(audio_path, start_time, duration, output_path):
    """
    Extract a chunk of audio using ffmpeg.

    Args:
        audio_path: Input audio file
        start_time: Start time in seconds
        duration: Duration in seconds
        output_path: Output file path
    """
    cmd = [
        'ffmpeg',
        '-ss', str(start_time),
        '-i', str(audio_path),
        '-t', str(duration),
        '-acodec', 'aac',  # Re-encode to AAC for M4A container
        '-ar', '44100',    # Keep original sample rate
        '-y',
        str(output_path)
    ]
    subprocess.run(cmd, capture_output=True, check=True)


def transcribe_audio_chunked(audio_path, chunk_duration=300, job_id=None, **whisper_options):
    """
    Transcribe audio in chunks to prevent sync issues on long videos.

    Args:
        audio_path: Path to audio file
        chunk_duration: Duration of each chunk in seconds (default: 300 = 5 minutes)
        job_id: Optional job ID for progress tracking
        **whisper_options: Additional options for Whisper API (language, prompt, etc.)

    Returns:
        tuple: (subtitles_list, detected_language)
    """
    total_duration = get_audio_duration(audio_path)
    num_chunks = math.ceil(total_duration / chunk_duration)

    print(f'Audio duration: {total_duration:.2f}s')
    print(f'Splitting into {num_chunks} chunks of ~{chunk_duration}s each')

    all_subtitles = []
    temp_chunks = []
    detected_language = None
    previous_texts = []

    try:
        for i in range(num_chunks):
            start_time = i * chunk_duration

            # Last chunk might be shorter
            current_duration = min(chunk_duration, total_duration - start_time)

            print(f'Processing chunk {i+1}/{num_chunks} ({start_time:.2f}s - {start_time + current_duration:.2f}s)')

            # Update progress (scale from 30 to 90)
            if job_id:
                progress_value = 30 + int((i / num_chunks) * 60)
                update_progress(
                    job_id,
                    progress_value,
                    f'Processing chunk {i+1}/{num_chunks}',
                    'processing'
                )

            # Create temporary chunk file (.m4a is supported by Whisper API)
            chunk_path = Path(audio_path).parent / f'chunk_{i}.m4a'
            temp_chunks.append(chunk_path)

            # Extract chunk
            split_audio_chunk(audio_path, start_time, current_duration, chunk_path)

            # Transcribe chunk
            with open(chunk_path, 'rb') as audio_file:
                transcription_options = {
                    'file': audio_file,
                    'model': 'whisper-1',
                    'response_format': 'verbose_json',
                    'timestamp_granularities': ['segment', 'word'],  # Word-level for better timing
                    **whisper_options
                }

                # Remove prompt to avoid hallucinations with music
                if 'prompt' in transcription_options:
                    del transcription_options['prompt']

                transcription = client.audio.transcriptions.create(**transcription_options)

                # Get detected language from first chunk
                if i == 0:
                    detected_language = transcription.language

                # Adjust timestamps
                chunk_subtitles = []
                for segment in transcription.segments:
                    text = segment.text.strip()

                    # Basic filtering - only skip truly empty or noise
                    if not text or len(text) < 2:
                        continue

                    subtitle = {
                        'id': len(all_subtitles) + 1,
                        'start': segment.start + start_time,  # Add offset
                        'end': segment.end + start_time,      # Add offset
                        'text': text
                    }
                    all_subtitles.append(subtitle)
                    chunk_subtitles.append(subtitle)

                # Add chunk subtitles to progress (for incremental updates)
                if job_id and chunk_subtitles:
                    add_subtitles(job_id, chunk_subtitles)

            print(f'Chunk {i+1} complete: {len(chunk_subtitles)} segments')

    finally:
        # Clean up temporary chunk files
        for chunk_path in temp_chunks:
            if chunk_path.exists():
                try:
                    chunk_path.unlink()
                except:
                    pass

    # Fill gaps with music placeholders to maintain sync
    all_subtitles = fill_music_gaps(all_subtitles, total_duration, gap_threshold=3.0)

    print(f'Total subtitles generated: {len(all_subtitles)} (including music placeholders)')
    return all_subtitles, detected_language


def fill_music_gaps(subtitles, total_duration, gap_threshold=3.0):
    """
    Fill gaps in subtitles (likely music sections) with placeholder subtitles.

    Args:
        subtitles: List of subtitle dictionaries
        total_duration: Total audio duration in seconds
        gap_threshold: Minimum gap size to fill (default: 3.0 seconds)

    Returns:
        List of subtitles with music placeholders inserted
    """
    if not subtitles:
        return subtitles

    filled_subtitles = []

    # Check for gap at the beginning
    if subtitles[0]['start'] > gap_threshold:
        filled_subtitles.append({
            'id': 1,
            'start': 0,
            'end': subtitles[0]['start'],
            'text': '♪'
        })

    # Process each subtitle and check for gaps
    for i, subtitle in enumerate(subtitles):
        # Update ID to account for inserted placeholders
        subtitle['id'] = len(filled_subtitles) + 1
        filled_subtitles.append(subtitle)

        # Check gap between current and next subtitle
        if i < len(subtitles) - 1:
            current_end = subtitle['end']
            next_start = subtitles[i + 1]['start']
            gap_duration = next_start - current_end

            # If gap is significant, insert music placeholder
            if gap_duration > gap_threshold:
                filled_subtitles.append({
                    'id': len(filled_subtitles) + 1,
                    'start': current_end,
                    'end': next_start,
                    'text': '♪'
                })

    # Check for gap at the end
    if subtitles[-1]['end'] < total_duration - gap_threshold:
        filled_subtitles.append({
            'id': len(filled_subtitles) + 1,
            'start': subtitles[-1]['end'],
            'end': total_duration,
            'text': '♪'
        })

    return filled_subtitles


def should_use_chunking(duration_seconds, threshold=600):
    """
    Determine if video should be processed in chunks.

    Args:
        duration_seconds: Video duration in seconds
        threshold: Threshold in seconds (default: 600 = 10 minutes)

    Returns:
        bool: True if chunking is recommended
    """
    return duration_seconds > threshold
