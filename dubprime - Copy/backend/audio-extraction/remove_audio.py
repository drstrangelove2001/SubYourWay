"""
Video Audio Removal Tool
-------------------------
Removes audio track from video files programmatically.
Supports multiple methods: moviepy and FFmpeg.
"""

import os
import sys
import argparse
import subprocess
from pathlib import Path
from typing import Optional


class AudioRemover:
    """Class to handle audio removal from video files."""
    
    def __init__(self, video_path: str, output_path: Optional[str] = None, 
                 method: str = "moviepy", save_audio: bool = True, 
                 audio_format: str = "mp3"):
        """
        Initialize AudioRemover.
        
        Args:
            video_path: Path to input video file
            output_path: Path for output video (optional, auto-generated if not provided)
            method: Method to use - 'moviepy' or 'ffmpeg' (default: 'moviepy')
            save_audio: If True, save the extracted audio to a file (default: True)
            audio_format: Format for saved audio - 'mp3', 'wav', 'aac', 'm4a' (default: 'mp3')
        """
        self.video_path = Path(video_path)
        if not self.video_path.exists():
            raise FileNotFoundError(f"Video file not found: {video_path}")
        
        # Auto-generate output path if not provided
        if output_path is None:
            output_dir = self.video_path.parent
            output_name = f"{self.video_path.stem}_no_audio{self.video_path.suffix}"
            self.output_path = output_dir / output_name
        else:
            self.output_path = Path(output_path)
        
        self.method = method.lower()
        if self.method not in ["moviepy", "ffmpeg"]:
            raise ValueError("Method must be either 'moviepy' or 'ffmpeg'")
        
        self.save_audio = save_audio
        self.audio_format = audio_format.lower()
        
        # Auto-generate audio output path
        if self.save_audio:
            audio_dir = self.video_path.parent
            audio_name = f"{self.video_path.stem}_audio.{self.audio_format}"
            self.audio_path = audio_dir / audio_name
        else:
            self.audio_path = None
    
    def remove_audio_moviepy(self) -> bool:
        """
        Remove audio using moviepy library.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            from moviepy.editor import VideoFileClip
            
            print(f"Loading video: {self.video_path}")
            video = VideoFileClip(str(self.video_path))
            
            # Check if video has audio
            if video.audio is None:
                print("⚠️  Video has no audio track to remove")
                video.close()
                return False
            
            # Extract and save audio if requested
            if self.save_audio:
                print(f"Extracting audio to: {self.audio_path}")
                video.audio.write_audiofile(
                    str(self.audio_path),
                    verbose=False,
                    logger=None
                )
                print(f"✅ Audio extracted: {self.audio_path}")
            
            print("Removing audio track from video...")
            # Create new video without audio
            video_no_audio = video.without_audio()
            
            print(f"Writing output video: {self.output_path}")
            video_no_audio.write_videofile(
                str(self.output_path),
                codec='libx264',
                audio=False,
                verbose=False,
                logger=None
            )
            
            # Clean up
            video.close()
            video_no_audio.close()
            
            print(f"✅ Successfully removed audio!")
            print(f"📁 Video saved to: {self.output_path}")
            if self.save_audio:
                print(f"🔊 Audio saved to: {self.audio_path}")
            return True
            
        except ImportError:
            print("❌ Error: moviepy is not installed")
            print("Install it with: pip install moviepy")
            return False
        except Exception as e:
            print(f"❌ Error removing audio with moviepy: {str(e)}")
            return False
    
    def remove_audio_ffmpeg(self) -> bool:
        """
        Remove audio using FFmpeg command-line tool.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Check if ffmpeg is available
            result = subprocess.run(
                ['ffmpeg', '-version'],
                capture_output=True,
                text=True
            )
            if result.returncode != 0:
                raise FileNotFoundError("FFmpeg not found")
            
            print(f"Using FFmpeg to process: {self.video_path}")
            
            # Extract audio if requested
            if self.save_audio:
                print(f"Extracting audio to: {self.audio_path}")
                audio_command = [
                    'ffmpeg',
                    '-i', str(self.video_path),
                    '-vn',  # No video
                    '-acodec', self._get_audio_codec(),
                    '-y',   # Overwrite output file if exists
                    str(self.audio_path)
                ]
                
                result = subprocess.run(
                    audio_command,
                    capture_output=True,
                    text=True
                )
                
                if result.returncode == 0:
                    print(f"✅ Audio extracted: {self.audio_path}")
                else:
                    print(f"⚠️  Warning: Could not extract audio: {result.stderr}")
            
            # FFmpeg command to copy video stream without audio
            print("Removing audio track from video...")
            video_command = [
                'ffmpeg',
                '-i', str(self.video_path),
                '-c:v', 'copy',  # Copy video codec (no re-encoding)
                '-an',            # Remove audio
                '-y',             # Overwrite output file if exists
                str(self.output_path)
            ]
            
            result = subprocess.run(
                video_command,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print(f"✅ Successfully removed audio!")
                print(f"📁 Video saved to: {self.output_path}")
                if self.save_audio:
                    print(f"🔊 Audio saved to: {self.audio_path}")
                return True
            else:
                print(f"❌ FFmpeg error: {result.stderr}")
                return False
                
        except FileNotFoundError:
            print("❌ Error: FFmpeg is not installed or not in PATH")
            print("Install FFmpeg from: https://ffmpeg.org/download.html")
            return False
        except Exception as e:
            print(f"❌ Error removing audio with FFmpeg: {str(e)}")
            return False
    
    def _get_audio_codec(self) -> str:
        """Get FFmpeg audio codec based on format."""
        codec_map = {
            'mp3': 'libmp3lame',
            'wav': 'pcm_s16le',
            'aac': 'aac',
            'm4a': 'aac',
            'ogg': 'libvorbis',
            'flac': 'flac'
        }
        return codec_map.get(self.audio_format, 'libmp3lame')
    
    def remove_audio(self) -> bool:
        """
        Remove audio using the specified method.
        
        Returns:
            True if successful, False otherwise
        """
        print(f"\n{'='*60}")
        print(f"Audio Removal Tool")
        print(f"{'='*60}")
        print(f"Input:  {self.video_path}")
        print(f"Output: {self.output_path}")
        print(f"Method: {self.method.upper()}")
        print(f"{'='*60}\n")
        
        if self.method == "moviepy":
            return self.remove_audio_moviepy()
        else:
            return self.remove_audio_ffmpeg()
    
    def get_file_info(self) -> dict:
        """
        Get information about the video and audio files.
        
        Returns:
            Dictionary with file information
        """
        info = {
            'input_path': str(self.video_path),
            'input_size_mb': self.video_path.stat().st_size / (1024 * 1024),
            'exists': self.video_path.exists()
        }
        
        if self.output_path.exists():
            info['output_path'] = str(self.output_path)
            info['output_size_mb'] = self.output_path.stat().st_size / (1024 * 1024)
            info['size_reduction_mb'] = info['input_size_mb'] - info['output_size_mb']
        
        if self.save_audio and self.audio_path and self.audio_path.exists():
            info['audio_path'] = str(self.audio_path)
            info['audio_size_mb'] = self.audio_path.stat().st_size / (1024 * 1024)
            info['audio_format'] = self.audio_format
        
        return info


def main():
    """Main function for command-line usage."""
    parser = argparse.ArgumentParser(
        description='Remove audio from video files',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Extract audio and create silent video (default - saves audio as MP3)
  python remove_audio.py input.mp4
  
  # Extract audio using FFmpeg (faster)
  python remove_audio.py input.mp4 --method ffmpeg
  
  # Save audio as WAV format
  python remove_audio.py input.mp4 --audio-format wav
  
  # Don't save extracted audio (just remove it)
  python remove_audio.py input.mp4 --no-save-audio
  
  # Custom output with AAC audio
  python remove_audio.py input.mp4 -o silent.mp4 -f aac -m ffmpeg
        """
    )
    
    parser.add_argument(
        'video',
        help='Path to input video file'
    )
    
    parser.add_argument(
        '-o', '--output',
        help='Path to output video file (optional)',
        default=None
    )
    
    parser.add_argument(
        '-m', '--method',
        choices=['moviepy', 'ffmpeg'],
        default='moviepy',
        help='Method to use for audio removal (default: moviepy)'
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
        help='Format for extracted audio file (default: mp3)'
    )
    
    parser.add_argument(
        '--info',
        action='store_true',
        help='Show file information after processing'
    )
    
    args = parser.parse_args()
    
    try:
        # Create audio remover instance
        remover = AudioRemover(
            video_path=args.video,
            output_path=args.output,
            method=args.method,
            save_audio=not args.no_save_audio,
            audio_format=args.audio_format
        )
        
        # Remove audio
        success = remover.remove_audio()
        
        # Show file info if requested
        if args.info and success:
            print(f"\n{'='*60}")
            print("File Information:")
            print(f"{'='*60}")
            info = remover.get_file_info()
            for key, value in info.items():
                if isinstance(value, float):
                    print(f"{key}: {value:.2f} MB")
                else:
                    print(f"{key}: {value}")
            print(f"{'='*60}\n")
        
        return 0 if success else 1
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return 1


if __name__ == "__main__":
    sys.exit(main())

