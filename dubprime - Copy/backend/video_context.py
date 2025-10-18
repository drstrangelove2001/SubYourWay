"""
Video Context Analysis Integration
-----------------------------------
Integrates Gemini video analysis to provide context for better subtitle translation.
"""

import os
import sys
from pathlib import Path

# Add video-analysis directory to path
video_analysis_dir = Path(__file__).parent / 'video-analysis'
sys.path.insert(0, str(video_analysis_dir))

try:
    from geminicontextor import analyze_video_framesapi
    from analyze_video_complete import analyze_scene_overview, combine_descriptions
    GEMINI_AVAILABLE = True
except ImportError:
    print("Warning: Gemini video analysis not available")
    GEMINI_AVAILABLE = False


def analyze_video_context(video_path, fps=1.0, batch_size=8):
    """
    Analyze video to extract cultural context for better subtitle translation.

    Args:
        video_path: Path to video file
        fps: Frames per second to sample (default: 1.0 for faster processing)
        batch_size: Batch size for processing

    Returns:
        str: Cultural context description or None
    """
    if not GEMINI_AVAILABLE:
        return None

    if not os.getenv('GEMINI_API_KEY'):
        print("Warning: GEMINI_API_KEY not set, skipping video analysis")
        return None

    try:
        print(f"Analyzing video context from {Path(video_path).name}...")

        # Analyze video frames
        frame_data = analyze_video_framesapi(
            video_path=video_path,
            fps=fps,
            batch_size=batch_size,
            model="gemini-2.0-flash-exp"
        )

        if not frame_data:
            return None

        # Combine descriptions
        combined = combine_descriptions(frame_data)

        if not combined:
            return None

        # Get scene overview
        scene_overview = analyze_scene_overview(combined)

        print(f"Video context extracted: {scene_overview[:100]}...")

        return scene_overview

    except Exception as e:
        print(f"Error analyzing video context: {e}")
        return None


def get_auto_context(video_path, cultural_context_input=None):
    """
    Get cultural context either from user input or video analysis.

    Args:
        video_path: Path to video file
        cultural_context_input: User-provided cultural context (optional)

    Returns:
        str: Cultural context to use for transcription/translation
    """
    # If user provided context, use that
    if cultural_context_input and cultural_context_input.strip():
        return cultural_context_input.strip()

    # Otherwise, try to extract from video
    auto_context = analyze_video_context(video_path, fps=0.5, batch_size=4)

    if auto_context:
        return f"Video context: {auto_context}"

    return None
