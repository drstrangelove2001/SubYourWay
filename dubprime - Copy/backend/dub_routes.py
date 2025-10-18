"""
Dubbing Routes
--------------
API endpoints for generating dubbed videos from SRT files.
"""

from flask import Blueprint, request, jsonify, send_file
from pathlib import Path
import os
import uuid
import subprocess
import pysrt
from elevenlabs.client import ElevenLabs
from pydub import AudioSegment
from dotenv import load_dotenv
import traceback
from threading import Thread
import json

load_dotenv()

dub_bp = Blueprint('dub', __name__, url_prefix='/api')

# Store dubbing job states
dubbing_jobs = {}

class DubbingJob:
    def __init__(self, job_id):
        self.job_id = job_id
        self.status = 'initializing'
        self.progress = 0
        self.message = 'Initializing...'
        self.error = None
        self.output_file = None
        
    def update(self, status=None, progress=None, message=None):
        if status:
            self.status = status
        if progress is not None:
            self.progress = progress
        if message:
            self.message = message
        dubbing_jobs[self.job_id] = self.__dict__


def generate_dubbed_audio(srt_file_path, output_dir, voice_id, job):
    """Generate dubbed audio from SRT file using ElevenLabs."""
    try:
        job.update(status='generating_audio', progress=10, message='Loading SRT file...')
        
        # Load SRT
        subs = pysrt.open(srt_file_path)
        job.update(progress=15, message=f'Processing {len(subs)} subtitle entries...')
        
        # Initialize ElevenLabs
        api_key = os.getenv("ELEVEN_LABS_API_KEY")
        if not api_key:
            raise Exception("ELEVEN_LABS_API_KEY not found in environment variables")
        
        client = ElevenLabs(api_key=api_key)
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Combined audio track
        combined_audio = AudioSegment.empty()
        current_time_ms = 0
        
        # Generate audio for each subtitle
        for i, sub in enumerate(subs):
            progress = 15 + int((i / len(subs)) * 30)  # 15-45%
            job.update(
                progress=progress,
                message=f'Generating audio {i + 1}/{len(subs)}: {sub.text[:50]}...'
            )
            
            # Calculate subtitle timing
            start_ms = (sub.start.hours * 3600000 + 
                       sub.start.minutes * 60000 + 
                       sub.start.seconds * 1000 + 
                       sub.start.milliseconds)
            
            # Add silence to reach subtitle start time
            if start_ms > current_time_ms:
                silence_duration = start_ms - current_time_ms
                combined_audio += AudioSegment.silent(duration=silence_duration)
                current_time_ms = start_ms
            
            # Generate audio
            audio_generator = client.text_to_speech.convert(
                voice_id=voice_id,
                text=sub.text,
                model_id="eleven_multilingual_v2"
            )
            
            # Collect audio bytes
            audio_bytes = b"".join(audio_generator)
            
            # Save individual file
            temp_filename = os.path.join(output_dir, f"sub_{i + 1}.mp3")
            with open(temp_filename, "wb") as f:
                f.write(audio_bytes)
            
            # Load and add to combined track
            audio_segment = AudioSegment.from_mp3(temp_filename)
            combined_audio += audio_segment
            current_time_ms += len(audio_segment)
        
        # Export combined audio
        job.update(progress=45, message='Saving combined audio...')
        combined_output = os.path.join(output_dir, "combined_audio.mp3")
        combined_audio.export(combined_output, format="mp3")
        
        return combined_output
        
    except Exception as e:
        raise Exception(f"Error generating dubbed audio: {str(e)}")


def separate_audio(video_file, job):
    """Separate vocals from background using Demucs."""
    try:
        job.update(status='separating_audio', progress=50, message='Separating vocals from background...')
        
        # Run demucs
        result = subprocess.run(
            ['demucs', '--two-stems=vocals', video_file],
            capture_output=True,
            text=True,
            check=True
        )
        
        # Find output file
        video_name = Path(video_file).stem
        background_audio = f"separated/htdemucs/{video_name}/no_vocals.wav"
        
        if not os.path.exists(background_audio):
            raise Exception(f"Separated audio not found at {background_audio}")
        
        job.update(progress=65, message='Audio separation complete')
        return background_audio
        
    except subprocess.CalledProcessError as e:
        raise Exception(f"Demucs separation failed: {e.stderr}")
    except Exception as e:
        raise Exception(f"Error separating audio: {str(e)}")


def combine_and_merge(video_file, dubbed_audio, background_audio, output_video, job):
    """Combine dubbed audio with background and merge back with video."""
    try:
        # Step 1: Combine audio tracks
        job.update(status='combining_audio', progress=70, message='Combining dubbed voice with background music...')
        
        temp_combined = f"temp_combined_{uuid.uuid4().hex}.mp3"
        
        combine_cmd = [
            'ffmpeg',
            '-i', dubbed_audio,
            '-i', background_audio,
            '-filter_complex',
            '[0:a]volume=1.2[a1];[1:a]volume=0.4[a2];[a1][a2]amix=inputs=2:duration=longest',
            '-y',
            temp_combined
        ]
        
        result = subprocess.run(combine_cmd, capture_output=True, text=True, check=True)
        
        # Step 2: Merge with video
        job.update(status='merging_video', progress=85, message='Merging audio with video...')
        
        merge_cmd = [
            'ffmpeg',
            '-i', video_file,
            '-i', temp_combined,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-map', '0:v:0',
            '-map', '1:a:0',
            '-shortest',
            '-y',
            output_video
        ]
        
        result = subprocess.run(merge_cmd, capture_output=True, text=True, check=True)
        
        # Cleanup
        if os.path.exists(temp_combined):
            os.remove(temp_combined)
        
        job.update(progress=100, message='Dubbing complete!')
        
    except subprocess.CalledProcessError as e:
        raise Exception(f"FFmpeg error: {e.stderr}")
    except Exception as e:
        raise Exception(f"Error combining and merging: {str(e)}")


def process_dubbing(job_id, video_path, srt_path, voice_id, output_path):
    """Background task to process the entire dubbing workflow."""
    job = DubbingJob(job_id)
    dubbing_jobs[job_id] = job.__dict__
    
    try:
        # Create temp directory for this job
        temp_dir = Path('temp_dubbing') / job_id
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        # Step 1: Generate dubbed audio from SRT
        job.update(status='generating_audio', progress=5, message='Starting audio generation...')
        dubbed_audio = generate_dubbed_audio(
            srt_path,
            str(temp_dir / 'audio'),
            voice_id,
            job
        )
        
        # Step 2: Separate background audio from video
        job.update(status='separating_audio', progress=50, message='Separating audio...')
        background_audio = separate_audio(video_path, job)
        
        # Step 3: Combine and merge
        job.update(status='combining', progress=70, message='Combining and merging...')
        combine_and_merge(video_path, dubbed_audio, background_audio, output_path, job)
        
        # Complete
        job.update(status='completed', progress=100, message='Dubbing completed successfully!')
        job.output_file = output_path
        
    except Exception as e:
        print(f"Error in dubbing job {job_id}: {str(e)}")
        traceback.print_exc()
        job.update(status='error', message=str(e))
        job.error = str(e)


@dub_bp.route('/dub', methods=['POST'])
def create_dubbing_job():
    """Create a new dubbing job with video and SRT file."""
    try:
        # Check if video and SRT files are provided
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        if 'srt' not in request.files:
            return jsonify({'error': 'No SRT file provided'}), 400
        
        video_file = request.files['video']
        srt_file = request.files['srt']
        voice_id = request.form.get('voiceId', 'mbL34QDB5FptPamlgvX5')  # Default: Bill (Documentary)
        
        # Validate files
        if video_file.filename == '' or srt_file.filename == '':
            return jsonify({'error': 'Empty file provided'}), 400
        
        # Create job ID
        job_id = str(uuid.uuid4())
        
        # Save uploaded files
        uploads_dir = Path('uploads') / job_id
        uploads_dir.mkdir(parents=True, exist_ok=True)
        
        video_path = uploads_dir / video_file.filename
        srt_path = uploads_dir / srt_file.filename
        
        video_file.save(video_path)
        srt_file.save(srt_path)
        
        # Create output path
        outputs_dir = Path('outputs') / job_id
        outputs_dir.mkdir(parents=True, exist_ok=True)
        output_path = outputs_dir / f"dubbed_{video_file.filename}"
        
        # Start background processing
        thread = Thread(
            target=process_dubbing,
            args=(job_id, str(video_path), str(srt_path), voice_id, str(output_path))
        )
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'jobId': job_id,
            'message': 'Dubbing job started',
            'status': 'processing'
        }), 202
        
    except Exception as e:
        print(f"Error creating dubbing job: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@dub_bp.route('/dub/progress/<job_id>', methods=['GET'])
def get_dubbing_progress(job_id):
    """Get the progress of a dubbing job."""
    if job_id not in dubbing_jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    return jsonify(dubbing_jobs[job_id])


@dub_bp.route('/dub/download/<job_id>', methods=['GET'])
def download_dubbed_video(job_id):
    """Download the completed dubbed video."""
    if job_id not in dubbing_jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    job = dubbing_jobs[job_id]
    
    if job['status'] != 'completed':
        return jsonify({'error': 'Job not completed yet'}), 400
    
    if not job.get('output_file') or not os.path.exists(job['output_file']):
        return jsonify({'error': 'Output file not found'}), 404
    
    return send_file(
        job['output_file'],
        as_attachment=True,
        download_name=Path(job['output_file']).name
    )

