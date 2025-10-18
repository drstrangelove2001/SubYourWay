"""
Example Usage of Audio Removal Tool
------------------------------------
Demonstrates how to use the audio removal functionality.
"""

from remove_audio import AudioRemover
from pathlib import Path


def example_1_basic():
    """Example 1: Basic audio removal with moviepy"""
    print("\n" + "="*60)
    print("Example 1: Basic Audio Removal (moviepy)")
    print("="*60)
    
    # Create instance
    remover = AudioRemover(
        video_path="clips/scene.mp4",
        method="moviepy"
    )
    
    # Remove audio
    success = remover.remove_audio()
    
    if success:
        # Get file info
        info = remover.get_file_info()
        print(f"\nFile size reduced by: {info.get('size_reduction_mb', 0):.2f} MB")


def example_2_ffmpeg():
    """Example 2: Fast audio removal with FFmpeg"""
    print("\n" + "="*60)
    print("Example 2: Fast Audio Removal (FFmpeg)")
    print("="*60)
    
    remover = AudioRemover(
        video_path="clips/scene.mp4",
        output_path="clips/scene_silent.mp4",
        method="ffmpeg"
    )
    
    success = remover.remove_audio()
    return success


def example_3_workflow():
    """Example 3: Complete dubbing workflow"""
    print("\n" + "="*60)
    print("Example 3: Dubbing Workflow")
    print("="*60)
    
    video_path = "clips/scene.mp4"
    
    # Step 1: Remove original audio
    print("\nStep 1: Removing original audio...")
    remover = AudioRemover(video_path, method="ffmpeg")
    
    if not remover.remove_audio():
        print("Failed to remove audio")
        return
    
    silent_video = str(remover.output_path)
    
    # Step 2: Analyze video (if needed)
    print("\nStep 2: Video is ready for analysis and dubbing")
    print(f"Silent video: {silent_video}")
    
    # Step 3: Would add subtitles/dubs here
    print("\nStep 3: Add your dubbing logic here...")
    print("- Analyze with Gemini AI")
    print("- Generate context-aware subtitles")
    print("- Burn subtitles into video")
    print("- Add new audio track")
    
    print("\n✅ Workflow complete!")


def example_4_batch():
    """Example 4: Batch processing"""
    print("\n" + "="*60)
    print("Example 4: Batch Processing")
    print("="*60)
    
    from batch_remove_audio import process_batch
    
    # Process all videos in clips directory
    results = process_batch(
        input_dir="clips",
        output_dir="clips/no_audio",
        method="ffmpeg"
    )
    
    print(f"\nProcessed {results['success']} out of {results['total']} videos")


def example_5_error_handling():
    """Example 5: Proper error handling"""
    print("\n" + "="*60)
    print("Example 5: Error Handling")
    print("="*60)
    
    try:
        # Try to process a video
        remover = AudioRemover("clips/scene.mp4", method="ffmpeg")
        
        if remover.remove_audio():
            print("✅ Success!")
            
            # Check if output exists
            if remover.output_path.exists():
                print(f"Output file created: {remover.output_path}")
        else:
            print("❌ Failed to remove audio")
            
    except FileNotFoundError as e:
        print(f"❌ Video file not found: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")


def example_6_programmatic():
    """Example 6: Programmatic usage in an application"""
    print("\n" + "="*60)
    print("Example 6: Programmatic Usage")
    print("="*60)
    
    def process_uploaded_video(video_path: str) -> dict:
        """
        Process an uploaded video - remove audio and return info.
        
        Returns:
            Dictionary with processing results
        """
        try:
            remover = AudioRemover(video_path, method="ffmpeg")
            success = remover.remove_audio()
            
            if success:
                info = remover.get_file_info()
                return {
                    'status': 'success',
                    'output_path': str(remover.output_path),
                    'size_reduction_mb': info.get('size_reduction_mb', 0),
                    'original_size_mb': info['input_size_mb'],
                    'new_size_mb': info.get('output_size_mb', 0)
                }
            else:
                return {
                    'status': 'failed',
                    'error': 'Audio removal failed'
                }
                
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }
    
    # Simulate processing
    result = process_uploaded_video("clips/scene.mp4")
    print(f"\nProcessing result:")
    for key, value in result.items():
        print(f"  {key}: {value}")


def main():
    """Run all examples"""
    print("\n" + "="*70)
    print("Audio Removal Tool - Examples")
    print("="*70)
    
    print("\nThese examples demonstrate different ways to use the audio removal tool.")
    print("Make sure you have a video file at 'clips/scene.mp4' to test with.")
    
    # Check if example video exists
    test_video = Path("clips/scene.mp4")
    if not test_video.exists():
        print("\n⚠️  Warning: Example video not found at clips/scene.mp4")
        print("Create a clips directory and add a video file to test.")
        return
    
    # Run examples (comment out ones you don't want to run)
    try:
        # example_1_basic()         # Uncomment to run
        # example_2_ffmpeg()        # Uncomment to run
        example_3_workflow()      # Workflow example
        # example_4_batch()         # Uncomment to run
        example_5_error_handling()
        example_6_programmatic()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n❌ Error running examples: {e}")


if __name__ == "__main__":
    main()

