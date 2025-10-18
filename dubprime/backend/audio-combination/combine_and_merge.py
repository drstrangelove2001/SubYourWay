import os
import sys
import subprocess
from pathlib import Path


def combine_and_merge(video_file, dubbed_audio, background_audio, output_video):
    """
    Combines dubbed audio with background audio and merges back with video.
    
    Args:
        video_file (str): Path to the original video file
        dubbed_audio (str): Path to the generated dubbed audio (e.g., combined_audio.mp3)
        background_audio (str): Path to the background/instrumental audio (e.g., no_vocals.wav from demucs)
        output_video (str): Path for the output video file
    """
    
    # Step 1: Combine dubbed audio with background audio
    print("Step 1: Combining dubbed audio with background music...")
    temp_combined_audio = "temp_combined_audio.mp3"
    
    combine_cmd = [
        "ffmpeg",
        "-i", dubbed_audio,           # Input 1: Dubbed audio
        "-i", background_audio,        # Input 2: Background audio
        "-filter_complex",
        "[0:a]volume=1.2[a1];[1:a]volume=0.4[a2];[a1][a2]amix=inputs=2:duration=longest",
        "-y",
        temp_combined_audio
    ]
    
    try:
        subprocess.run(combine_cmd, check=True, capture_output=True, text=True)
        print(f"✓ Combined audio saved to {temp_combined_audio}")
    except subprocess.CalledProcessError as e:
        print(f"Error combining audio: {e.stderr}")
        sys.exit(1)
    
    # Step 2: Merge combined audio with video (replace original audio)
    print("\nStep 2: Merging combined audio with video...")
    
    merge_cmd = [
        "ffmpeg",
        "-i", video_file,              # Input video
        "-i", temp_combined_audio,     # Input audio
        "-c:v", "copy",                # Copy video codec (no re-encoding)
        "-c:a", "aac",                 # Audio codec
        "-map", "0:v:0",               # Map video from first input
        "-map", "1:a:0",               # Map audio from second input
        "-shortest",                   # Match shortest stream
        "-y",
        output_video
    ]
    
    try:
        subprocess.run(merge_cmd, check=True, capture_output=True, text=True)
        print(f"✓ Final video saved to {output_video}")
    except subprocess.CalledProcessError as e:
        print(f"Error merging audio with video: {e.stderr}")
        sys.exit(1)
    
    # Step 3: Clean up temporary file
    if os.path.exists(temp_combined_audio):
        os.remove(temp_combined_audio)
        print(f"✓ Cleaned up temporary files")
    
    print(f"\n🎬 Done! Your dubbed video is ready: {output_video}")


def separate_audio_first(video_file):
    """
    Uses demucs to separate vocals from background audio.
    
    Args:
        video_file (str): Path to the video file
    
    Returns:
        str: Path to the separated background audio (no_vocals.wav)
    """
    print("Separating audio from video using Demucs...")
    print("This may take a few minutes...\n")
    
    try:
        subprocess.run([
            "demucs",
            "--two-stems=vocals",
            video_file
        ], check=True)
        
        # Find the output file
        video_name = Path(video_file).stem
        # Demucs outputs to: separated/htdemucs/{video_name}/no_vocals.wav
        background_audio = f"separated/htdemucs/{video_name}/no_vocals.wav"
        
        if os.path.exists(background_audio):
            print(f"✓ Background audio separated to: {background_audio}\n")
            return background_audio
        else:
            print(f"Error: Expected output not found at {background_audio}")
            sys.exit(1)
            
    except subprocess.CalledProcessError as e:
        print(f"Error running demucs: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print("Error: demucs not found. Install it with: pip install demucs")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage:")
        print("  Option 1 - With pre-separated background audio:")
        print("    python combine_and_merge.py <video_file> <dubbed_audio> <background_audio> [output_video]")
        print("\n  Option 2 - Auto-separate first:")
        print("    python combine_and_merge.py <video_file> <dubbed_audio> --separate [output_video]")
        print("\nExample:")
        print("  python combine_and_merge.py original.mp4 combined_audio.mp3 --separate output_dubbed.mp4")
        sys.exit(1)
    
    video_file = sys.argv[1]
    dubbed_audio = sys.argv[2]
    
    # Check if we need to separate first
    if len(sys.argv) >= 4 and sys.argv[3] == "--separate":
        background_audio = separate_audio_first(video_file)
        output_video = sys.argv[4] if len(sys.argv) > 4 else "output_dubbed.mp4"
    else:
        background_audio = sys.argv[3]
        output_video = sys.argv[4] if len(sys.argv) > 4 else "output_dubbed.mp4"
    
    # Validate inputs
    if not os.path.exists(video_file):
        print(f"Error: Video file not found: {video_file}")
        sys.exit(1)
    
    if not os.path.exists(dubbed_audio):
        print(f"Error: Dubbed audio file not found: {dubbed_audio}")
        sys.exit(1)
    
    if not os.path.exists(background_audio):
        print(f"Error: Background audio file not found: {background_audio}")
        sys.exit(1)
    
    # Run the combination and merge
    combine_and_merge(video_file, dubbed_audio, background_audio, output_video)

