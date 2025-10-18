"""
Batch Audio Removal Tool
------------------------
Remove audio from multiple video files at once.
"""

import os
import sys
import argparse
from pathlib import Path
from typing import List
from remove_audio import AudioRemover


def find_video_files(directory: str, extensions: List[str] = None) -> List[Path]:
    """
    Find all video files in a directory.
    
    Args:
        directory: Directory to search
        extensions: List of video file extensions (default: common video formats)
    
    Returns:
        List of video file paths
    """
    if extensions is None:
        extensions = ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.webm']
    
    directory = Path(directory)
    video_files = []
    
    for ext in extensions:
        video_files.extend(directory.glob(f"*{ext}"))
        video_files.extend(directory.glob(f"*{ext.upper()}"))
    
    return sorted(video_files)


def process_batch(
    input_dir: str,
    output_dir: str = None,
    method: str = "moviepy",
    recursive: bool = False,
    save_audio: bool = True,
    audio_format: str = "mp3"
) -> dict:
    """
    Process all videos in a directory.
    
    Args:
        input_dir: Input directory containing videos
        output_dir: Output directory (optional, uses input_dir if not provided)
        method: Method to use ('moviepy' or 'ffmpeg')
        recursive: Search subdirectories recursively
        save_audio: If True, save the extracted audio to files (default: True)
        audio_format: Format for saved audio - 'mp3', 'wav', 'aac', etc. (default: 'mp3')
    
    Returns:
        Dictionary with processing statistics
    """
    input_path = Path(input_dir)
    if not input_path.exists():
        raise FileNotFoundError(f"Input directory not found: {input_dir}")
    
    # Set output directory
    if output_dir is None:
        output_path = input_path / "no_audio"
    else:
        output_path = Path(output_dir)
    
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Find video files
    if recursive:
        video_files = []
        for ext in ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.webm']:
            video_files.extend(input_path.rglob(f"*{ext}"))
            video_files.extend(input_path.rglob(f"*{ext.upper()}"))
        video_files = sorted(set(video_files))
    else:
        video_files = find_video_files(input_dir)
    
    if not video_files:
        print(f"⚠️  No video files found in {input_dir}")
        return {'total': 0, 'success': 0, 'failed': 0}
    
    print(f"\n{'='*60}")
    print(f"Batch Audio Removal")
    print(f"{'='*60}")
    print(f"Found {len(video_files)} video files")
    print(f"Input directory:  {input_path}")
    print(f"Output directory: {output_path}")
    print(f"Method: {method.upper()}")
    print(f"{'='*60}\n")
    
    # Process each video
    results = {'total': len(video_files), 'success': 0, 'failed': 0, 'files': []}
    
    for i, video_file in enumerate(video_files, 1):
        print(f"\n[{i}/{len(video_files)}] Processing: {video_file.name}")
        print("-" * 60)
        
        try:
            # Generate output path
            output_file = output_path / f"{video_file.stem}_no_audio{video_file.suffix}"
            
            # Create remover and process
            remover = AudioRemover(
                video_path=str(video_file),
                output_path=str(output_file),
                method=method,
                save_audio=save_audio,
                audio_format=audio_format
            )
            
            success = remover.remove_audio()
            
            if success:
                results['success'] += 1
                results['files'].append({
                    'input': str(video_file),
                    'output': str(output_file),
                    'status': 'success'
                })
            else:
                results['failed'] += 1
                results['files'].append({
                    'input': str(video_file),
                    'status': 'failed'
                })
                
        except Exception as e:
            print(f"❌ Error processing {video_file.name}: {str(e)}")
            results['failed'] += 1
            results['files'].append({
                'input': str(video_file),
                'status': 'error',
                'error': str(e)
            })
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"Batch Processing Complete")
    print(f"{'='*60}")
    print(f"Total files:  {results['total']}")
    print(f"Successful:   {results['success']} ✅")
    print(f"Failed:       {results['failed']} ❌")
    print(f"{'='*60}\n")
    
    return results


def main():
    """Main function for command-line usage."""
    parser = argparse.ArgumentParser(
        description='Batch remove audio from multiple video files',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process all videos in a directory
  python batch_remove_audio.py videos/
  
  # Process with FFmpeg
  python batch_remove_audio.py videos/ --method ffmpeg
  
  # Specify output directory
  python batch_remove_audio.py videos/ --output processed/
  
  # Process recursively (including subdirectories)
  python batch_remove_audio.py videos/ --recursive
        """
    )
    
    parser.add_argument(
        'input_dir',
        help='Directory containing video files'
    )
    
    parser.add_argument(
        '-o', '--output',
        help='Output directory (default: creates "no_audio" subfolder)',
        default=None
    )
    
    parser.add_argument(
        '-m', '--method',
        choices=['moviepy', 'ffmpeg'],
        default='moviepy',
        help='Method to use for audio removal (default: moviepy)'
    )
    
    parser.add_argument(
        '-r', '--recursive',
        action='store_true',
        help='Search subdirectories recursively'
    )
    
    parser.add_argument(
        '--no-save-audio',
        action='store_true',
        help='Do not save extracted audio (default: audio is saved)'
    )
    
    parser.add_argument(
        '-f', '--audio-format',
        choices=['mp3', 'wav', 'aac', 'm4a', 'ogg', 'flac'],
        default='mp3',
        help='Format for extracted audio files (default: mp3)'
    )
    
    args = parser.parse_args()
    
    try:
        results = process_batch(
            input_dir=args.input_dir,
            output_dir=args.output,
            method=args.method,
            recursive=args.recursive,
            save_audio=not args.no_save_audio,
            audio_format=args.audio_format
        )
        
        return 0 if results['failed'] == 0 else 1
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return 1


if __name__ == "__main__":
    sys.exit(main())

