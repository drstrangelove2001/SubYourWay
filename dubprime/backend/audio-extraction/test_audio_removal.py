"""
Test Audio Removal Functionality
---------------------------------
Simple test script to verify audio removal works correctly.
"""

import os
import sys
from pathlib import Path
from remove_audio import AudioRemover


def run_tests():
    """Run basic tests for audio removal."""
    
    print("\n" + "="*70)
    print("Testing Audio Removal Tool")
    print("="*70)
    
    # Test 1: Check if test video exists
    print("\n[Test 1] Checking for test video...")
    test_video = Path("clips/scene.mp4")
    
    if not test_video.exists():
        print("❌ Test video not found at clips/scene.mp4")
        print("Please add a test video to continue.")
        return False
    
    print(f"✅ Found test video: {test_video}")
    print(f"   Size: {test_video.stat().st_size / (1024*1024):.2f} MB")
    
    # Test 2: Initialize AudioRemover
    print("\n[Test 2] Initializing AudioRemover...")
    try:
        remover = AudioRemover(str(test_video), method="moviepy")
        print("✅ AudioRemover initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize: {e}")
        return False
    
    # Test 3: Check method validation
    print("\n[Test 3] Testing method validation...")
    try:
        invalid_remover = AudioRemover(str(test_video), method="invalid")
        print("❌ Should have raised ValueError for invalid method")
        return False
    except ValueError:
        print("✅ Method validation works correctly")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    # Test 4: Check file not found handling
    print("\n[Test 4] Testing file not found handling...")
    try:
        missing_remover = AudioRemover("nonexistent.mp4")
        print("❌ Should have raised FileNotFoundError")
        return False
    except FileNotFoundError:
        print("✅ File not found handling works correctly")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    # Test 5: Test auto-generated output path
    print("\n[Test 5] Testing auto-generated output path...")
    remover = AudioRemover(str(test_video))
    expected_output = test_video.parent / f"{test_video.stem}_no_audio{test_video.suffix}"
    if remover.output_path == expected_output:
        print(f"✅ Output path generated correctly: {remover.output_path.name}")
    else:
        print(f"❌ Output path mismatch")
        print(f"   Expected: {expected_output}")
        print(f"   Got: {remover.output_path}")
        return False
    
    # Test 6: Test custom output path
    print("\n[Test 6] Testing custom output path...")
    custom_output = Path("clips/custom_output.mp4")
    remover = AudioRemover(str(test_video), output_path=str(custom_output))
    if remover.output_path == custom_output:
        print(f"✅ Custom output path set correctly: {remover.output_path.name}")
    else:
        print(f"❌ Custom output path not set correctly")
        return False
    
    print("\n" + "="*70)
    print("All tests passed! ✅")
    print("="*70)
    
    # Offer to run actual processing test
    print("\n[Optional] Would you like to test actual audio removal?")
    print("This will create a test output file.")
    print("Note: This requires moviepy or FFmpeg to be installed.")
    
    return True


def test_actual_processing():
    """Test actual audio removal (optional, requires dependencies)."""
    
    print("\n" + "="*70)
    print("Testing Actual Audio Removal")
    print("="*70)
    
    test_video = Path("clips/scene.mp4")
    
    if not test_video.exists():
        print("❌ Test video not found")
        return False
    
    # Test with moviepy
    print("\n[Processing Test] Using moviepy...")
    try:
        remover = AudioRemover(
            str(test_video),
            output_path="clips/test_output_moviepy.mp4",
            method="moviepy"
        )
        success = remover.remove_audio()
        
        if success and remover.output_path.exists():
            print("✅ Moviepy method works!")
            info = remover.get_file_info()
            print(f"   Output size: {info.get('output_size_mb', 0):.2f} MB")
            print(f"   Size reduction: {info.get('size_reduction_mb', 0):.2f} MB")
            
            # Clean up test file
            remover.output_path.unlink()
            print("   (Cleaned up test file)")
        else:
            print("⚠️  Moviepy method didn't complete successfully")
            
    except ImportError:
        print("⚠️  Moviepy not installed - skipping moviepy test")
    except Exception as e:
        print(f"⚠️  Error testing moviepy: {e}")
    
    # Test with FFmpeg
    print("\n[Processing Test] Using FFmpeg...")
    try:
        remover = AudioRemover(
            str(test_video),
            output_path="clips/test_output_ffmpeg.mp4",
            method="ffmpeg"
        )
        success = remover.remove_audio()
        
        if success and remover.output_path.exists():
            print("✅ FFmpeg method works!")
            info = remover.get_file_info()
            print(f"   Output size: {info.get('output_size_mb', 0):.2f} MB")
            print(f"   Size reduction: {info.get('size_reduction_mb', 0):.2f} MB")
            
            # Clean up test file
            remover.output_path.unlink()
            print("   (Cleaned up test file)")
        else:
            print("⚠️  FFmpeg method didn't complete successfully")
            
    except Exception as e:
        print(f"⚠️  Error testing FFmpeg: {e}")
    
    print("\n" + "="*70)
    print("Processing tests complete!")
    print("="*70)
    
    return True


def main():
    """Main test function."""
    
    print("\n🧪 Audio Removal Tool - Test Suite")
    print("="*70)
    
    # Run basic tests
    if run_tests():
        print("\n✅ Basic tests passed!")
        
        # Ask about processing test
        print("\nTo test actual audio removal, uncomment the next line and run again.")
        print("Make sure moviepy or FFmpeg is installed first:")
        print("  pip install moviepy")
        print("  or install FFmpeg from https://ffmpeg.org")
        
        # Uncomment to run actual processing test:
        # test_actual_processing()
    else:
        print("\n❌ Some tests failed")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())

