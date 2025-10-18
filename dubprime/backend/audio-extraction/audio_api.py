"""
Audio Removal API Wrapper
--------------------------
Simple Flask API wrapper for the audio removal functionality.
Can be used to integrate audio removal into a web application.
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pathlib import Path
import os
from remove_audio import AudioRemover
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
UPLOAD_FOLDER = Path('uploads')
OUTPUT_FOLDER = Path('outputs')
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm'}

# Create folders if they don't exist
UPLOAD_FOLDER.mkdir(exist_ok=True)
OUTPUT_FOLDER.mkdir(exist_ok=True)


def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'audio-removal-api'
    })


@app.route('/api/remove-audio', methods=['POST'])
def remove_audio():
    """
    Remove audio from uploaded video and extract audio file.
    
    Form data:
        - file: Video file
        - method: 'moviepy' or 'ffmpeg' (optional, default: 'ffmpeg')
        - save_audio: 'true' or 'false' (optional, default: 'true')
        - audio_format: 'mp3', 'wav', 'aac', etc. (optional, default: 'mp3')
    
    Returns:
        JSON with status and download links
    """
    # Check if file is present
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400
    
    # Get parameters
    method = request.form.get('method', 'ffmpeg')
    if method not in ['moviepy', 'ffmpeg']:
        return jsonify({'error': 'Invalid method. Use "moviepy" or "ffmpeg"'}), 400
    
    save_audio = request.form.get('save_audio', 'true').lower() == 'true'
    audio_format = request.form.get('audio_format', 'mp3')
    
    try:
        # Save uploaded file
        filename = secure_filename(file.filename)
        input_path = UPLOAD_FOLDER / filename
        file.save(str(input_path))
        
        # Generate output filenames
        output_filename = f"{Path(filename).stem}_no_audio{Path(filename).suffix}"
        output_path = OUTPUT_FOLDER / output_filename
        
        # Remove audio and extract
        remover = AudioRemover(
            video_path=str(input_path),
            output_path=str(output_path),
            method=method,
            save_audio=save_audio,
            audio_format=audio_format
        )
        
        success = remover.remove_audio()
        
        if not success:
            return jsonify({'error': 'Failed to remove audio'}), 500
        
        # Get file info
        info = remover.get_file_info()
        
        # Clean up input file
        input_path.unlink()
        
        response_data = {
            'status': 'success',
            'message': 'Audio extracted and removed successfully' if save_audio else 'Audio removed successfully',
            'video_filename': output_filename,
            'video_download_url': f'/api/download/{output_filename}',
            'size_info': {
                'original_mb': round(info['input_size_mb'], 2),
                'new_mb': round(info.get('output_size_mb', 0), 2),
                'reduction_mb': round(info.get('size_reduction_mb', 0), 2)
            }
        }
        
        # Add audio info if saved
        if save_audio and 'audio_path' in info:
            audio_filename = Path(info['audio_path']).name
            response_data['audio_filename'] = audio_filename
            response_data['audio_download_url'] = f'/api/download/{audio_filename}'
            response_data['audio_size_mb'] = round(info.get('audio_size_mb', 0), 2)
            response_data['audio_format'] = info.get('audio_format', audio_format)
        
        return jsonify(response_data)
        
    except Exception as e:
        # Clean up on error
        if input_path.exists():
            input_path.unlink()
        
        return jsonify({'error': str(e)}), 500


@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    """
    Download processed video file.
    
    Args:
        filename: Name of the file to download
    """
    file_path = OUTPUT_FOLDER / secure_filename(filename)
    
    if not file_path.exists():
        return jsonify({'error': 'File not found'}), 404
    
    return send_file(
        str(file_path),
        as_attachment=True,
        download_name=filename
    )


@app.route('/api/files', methods=['GET'])
def list_files():
    """List all processed files."""
    files = []
    
    for file_path in OUTPUT_FOLDER.glob('*'):
        if file_path.is_file():
            files.append({
                'filename': file_path.name,
                'size_mb': round(file_path.stat().st_size / (1024*1024), 2),
                'download_url': f'/api/download/{file_path.name}'
            })
    
    return jsonify({
        'files': files,
        'count': len(files)
    })


@app.route('/api/files/<filename>', methods=['DELETE'])
def delete_file(filename):
    """Delete a processed file."""
    file_path = OUTPUT_FOLDER / secure_filename(filename)
    
    if not file_path.exists():
        return jsonify({'error': 'File not found'}), 404
    
    try:
        file_path.unlink()
        return jsonify({
            'status': 'success',
            'message': f'Deleted {filename}'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def main():
    """Run the API server."""
    print("\n" + "="*70)
    print("Audio Removal API Server")
    print("="*70)
    print("\nEndpoints:")
    print("  GET  /api/health          - Health check")
    print("  POST /api/remove-audio    - Remove audio from video")
    print("  GET  /api/download/<file> - Download processed video")
    print("  GET  /api/files           - List processed files")
    print("  DELETE /api/files/<file>  - Delete processed file")
    print("\nStarting server on http://localhost:5000")
    print("="*70 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)


if __name__ == '__main__':
    main()

