"""
Audio Removal Tool - Setup Script
----------------------------------
Automated setup and verification for the audio removal system.
"""

import subprocess
import sys
import platform
from pathlib import Path


def print_header(text):
    """Print a formatted header."""
    print("\n" + "="*70)
    print(text)
    print("="*70 + "\n")


def print_step(step_num, text):
    """Print a formatted step."""
    print(f"[Step {step_num}] {text}")


def check_python_version():
    """Check if Python version is sufficient."""
    print_step(1, "Checking Python version...")
    
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
        return True
    else:
        print(f"❌ Python 3.8+ required, found {version.major}.{version.minor}.{version.micro}")
        return False


def install_requirements():
    """Install Python requirements."""
    print_step(2, "Installing Python dependencies...")
    
    requirements_file = Path("requirements.txt")
    
    if not requirements_file.exists():
        print("❌ requirements.txt not found")
        return False
    
    try:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"],
            check=True,
            capture_output=True,
            text=True
        )
        print("✅ Python dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e.stderr}")
        return False


def check_moviepy():
    """Check if moviepy is installed."""
    print_step(3, "Checking moviepy installation...")
    
    try:
        import moviepy
        print(f"✅ moviepy is installed")
        return True
    except ImportError:
        print("⚠️  moviepy not installed (optional)")
        print("   Install with: pip install moviepy")
        return False


def check_ffmpeg():
    """Check if FFmpeg is installed."""
    print_step(4, "Checking FFmpeg installation...")
    
    try:
        result = subprocess.run(
            ['ffmpeg', '-version'],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode == 0:
            # Extract version from output
            version_line = result.stdout.split('\n')[0]
            print(f"✅ FFmpeg is installed")
            print(f"   Version: {version_line}")
            return True
        else:
            print("❌ FFmpeg not found")
            return False
            
    except (FileNotFoundError, subprocess.TimeoutExpired):
        print("⚠️  FFmpeg not installed (recommended)")
        show_ffmpeg_install_instructions()
        return False


def show_ffmpeg_install_instructions():
    """Show platform-specific FFmpeg installation instructions."""
    os_name = platform.system()
    
    print("\n   FFmpeg Installation Instructions:")
    
    if os_name == "Windows":
        print("   Windows:")
        print("   1. Download from: https://ffmpeg.org/download.html")
        print("   2. Extract to C:\\ffmpeg")
        print("   3. Add C:\\ffmpeg\\bin to System PATH")
        print("   4. Restart terminal/IDE")
        
    elif os_name == "Darwin":  # macOS
        print("   macOS:")
        print("   brew install ffmpeg")
        
    elif os_name == "Linux":
        print("   Linux:")
        print("   Ubuntu/Debian: sudo apt-get install ffmpeg")
        print("   CentOS/RHEL:   sudo yum install ffmpeg")
    
    print()


def verify_files():
    """Verify that all required files exist."""
    print_step(5, "Verifying installation files...")
    
    required_files = [
        "remove_audio.py",
        "batch_remove_audio.py",
        "audio_api.py",
        "example_usage.py",
        "test_audio_removal.py",
        "AUDIO_REMOVAL_README.md",
        "QUICKSTART.md"
    ]
    
    all_present = True
    for file in required_files:
        if Path(file).exists():
            print(f"   ✅ {file}")
        else:
            print(f"   ❌ {file} missing")
            all_present = False
    
    return all_present


def run_basic_test():
    """Run basic import test."""
    print_step(6, "Running basic tests...")
    
    try:
        from remove_audio import AudioRemover
        print("✅ Core module imports successfully")
        
        try:
            from batch_remove_audio import process_batch
            print("✅ Batch processing module imports successfully")
        except ImportError as e:
            print(f"⚠️  Batch module import warning: {e}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False


def show_next_steps(has_moviepy, has_ffmpeg):
    """Show next steps based on what's installed."""
    print_header("Setup Complete! 🎉")
    
    print("You can now use the audio removal tool!\n")
    
    # Show available methods
    if has_ffmpeg and has_moviepy:
        print("✅ Both FFmpeg and moviepy are available")
        print("   Recommended: Use FFmpeg for best performance\n")
    elif has_ffmpeg:
        print("✅ FFmpeg is available (recommended)")
        print("⚠️  moviepy not installed (optional)\n")
    elif has_moviepy:
        print("✅ moviepy is available")
        print("⚠️  FFmpeg not installed (recommended for better performance)\n")
    else:
        print("⚠️  Neither FFmpeg nor moviepy detected")
        print("   Install at least one to use the tool\n")
    
    # Show quick start commands
    print("Quick Start Commands:")
    print("-" * 70)
    
    if has_ffmpeg:
        print("\n1. Process a single video (FFmpeg - fast):")
        print("   python remove_audio.py video.mp4 --method ffmpeg\n")
    
    if has_moviepy:
        print("2. Process a single video (moviepy - Python only):")
        print("   python remove_audio.py video.mp4 --method moviepy\n")
    
    print("3. Batch process multiple videos:")
    print("   python batch_remove_audio.py videos/ --method ffmpeg\n")
    
    print("4. Run API server:")
    print("   python audio_api.py\n")
    
    print("5. Run tests:")
    print("   python test_audio_removal.py\n")
    
    print("6. See examples:")
    print("   python example_usage.py\n")
    
    print("Documentation:")
    print("-" * 70)
    print("- Quick Start: QUICKSTART.md")
    print("- Full Guide:  AUDIO_REMOVAL_README.md")
    print("- Summary:     AUDIO_REMOVAL_SUMMARY.md")
    print()


def main():
    """Main setup function."""
    print_header("Audio Removal Tool - Setup & Verification")
    
    print("This script will verify your installation and check dependencies.\n")
    
    # Run checks
    checks_passed = 0
    total_checks = 6
    
    if check_python_version():
        checks_passed += 1
    
    if install_requirements():
        checks_passed += 1
    
    has_moviepy = check_moviepy()
    if has_moviepy:
        checks_passed += 1
    
    has_ffmpeg = check_ffmpeg()
    if has_ffmpeg:
        checks_passed += 1
    
    if verify_files():
        checks_passed += 1
    
    if run_basic_test():
        checks_passed += 1
    
    # Summary
    print_header("Setup Summary")
    print(f"Checks passed: {checks_passed}/{total_checks}")
    
    if checks_passed == total_checks:
        print("🎉 Perfect! Everything is set up correctly.\n")
    elif checks_passed >= 4:
        print("✅ Core setup complete. Some optional features missing.\n")
    else:
        print("⚠️  Setup incomplete. Please review the errors above.\n")
    
    # Show next steps
    if checks_passed >= 4:
        show_next_steps(has_moviepy, has_ffmpeg)
    
    return 0 if checks_passed >= 4 else 1


if __name__ == "__main__":
    sys.exit(main())

