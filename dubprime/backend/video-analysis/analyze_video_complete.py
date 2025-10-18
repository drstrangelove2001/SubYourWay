#!/usr/bin/env python3
"""
Complete video analysis pipeline that combines frame analysis and scene overview.
Input: video file path and fps
Output: comprehensive scene overview
"""

import json
import os
from dotenv import load_dotenv
from google import genai
from geminicontextor import analyze_video_framesapi


def combine_descriptions(frame_data: list[dict]) -> str:
    """
    Combine all vision descriptions from frame analysis into a single formatted text.
    
    Args:
        frame_data: List of frame analysis results
        
    Returns:
        Combined description text with timestamps
    """
    combined = []
    for entry in frame_data:
        timestamp = entry.get('t_start', 0.0)
        
        # Handle both flat and nested vision structure
        description = None
        if 'vision.description' in entry:
            description = entry['vision.description']
        elif 'vision' in entry and isinstance(entry['vision'], dict):
            description = entry['vision'].get('description')
        
        if description:
            combined.append(f"[{timestamp:.2f}s] {description}")
    
    return "\n".join(combined)


def analyze_scene_overview(combined_descriptions: str, api_key: str = None) -> str:
    """
    Send combined descriptions to Gemini API for overall scene understanding.
    
    Args:
        combined_descriptions: The combined description text
        api_key: Gemini API key (will load from env if not provided)
        
    Returns:
        Gemini's analysis of the overall scene
    """
    if not api_key:
        load_dotenv()
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not found in environment or .env file")
    
    client = genai.Client(api_key=api_key)
    
    prompt = f"""You are an expert video scene analyst. Below are timestamped descriptions of scenes from a video.
Your task is to provide an overview like how a Singaporean would with instances of Singlish, of what happens in the video, without missing any important details.

Focus on:
- The setting and atmosphere
- Any notable changes or developments throughout the video
- Emotional tone and dramatic elements

Here are the scene descriptions:

{combined_descriptions}

Please provide a concise summary of what happens in this video scene:"""

    response = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=prompt
    )
    
    # Extract the text response
    if response.candidates and response.candidates[0].content.parts:
        return response.candidates[0].content.parts[0].text
    else:
        raise RuntimeError("No valid response from Gemini API")


def analyze_video_complete(
    video_path: str,
    fps: float = 4.0,
    batch_size: int = 8,
    save_intermediate: bool = False,
    save_final: bool = True,
    model: str = "gemini-2.0-flash-exp"
) -> dict:
    """
    Complete video analysis pipeline: frame-by-frame analysis + overall scene overview.
    
    Args:
        video_path: Path to the video file
        fps: Frames per second to sample (default: 4.0)
        batch_size: Number of frames to process in each batch (default: 8)
        save_intermediate: Save intermediate frame analysis to JSONL (default: False)
        save_final: Save final analysis to text file (default: True)
        model: Gemini model to use (default: gemini-2.0-flash-exp)
        
    Returns:
        Dictionary containing:
            - frame_data: List of per-frame analysis results
            - combined_descriptions: Combined timestamped descriptions
            - scene_overview: Overall scene analysis from Gemini
    """
    print(f"📹 Analyzing video: {video_path}")
    print(f"⚙️  Settings: {fps} FPS, batch size: {batch_size}")
    
    # Step 1: Analyze video frames
    print("\n🔍 Step 1: Analyzing video frames...")
    frame_data = analyze_video_framesapi(
        video_path=video_path,
        fps=fps,
        batch_size=batch_size,
        model=model
    )
    print(f"✅ Analyzed {len(frame_data)} frames")
    
    # Save intermediate results if requested
    if save_intermediate:
        intermediate_file = "frame_analysis_results.jsonl"
        with open(intermediate_file, 'w', encoding='utf-8') as f:
            for entry in frame_data:
                f.write(json.dumps(entry) + "\n")
        print(f"💾 Saved intermediate results to {intermediate_file}")
    
    # Step 2: Combine descriptions
    print("\n🔗 Step 2: Combining frame descriptions...")
    combined = combine_descriptions(frame_data)
    if not combined:
        raise RuntimeError("No descriptions found in frame analysis results")
    print(f"✅ Combined {len(frame_data)} descriptions")
    
    # Step 3: Generate overall scene overview
    print("\n🤖 Step 3: Generating overall scene overview with Gemini...")
    scene_overview = analyze_scene_overview(combined)
    print("✅ Scene overview generated")
    
    # Display results
    print("\n" + "="*80)
    print("📊 COMBINED FRAME DESCRIPTIONS:")
    print("="*80)
    print(combined)
    print("="*80)
    
    print("\n" + "="*80)
    print("🎬 OVERALL SCENE OVERVIEW:")
    print("="*80)
    print(scene_overview)
    print("="*80 + "\n")
    
    # Save final results if requested
    if save_final:
        output_file = "complete_video_analysis.txt"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"VIDEO ANALYSIS RESULTS\n")
            f.write(f"Video: {video_path}\n")
            f.write(f"FPS: {fps}, Batch Size: {batch_size}\n")
            f.write(f"Frames Analyzed: {len(frame_data)}\n")
            f.write("\n" + "="*80 + "\n")
            f.write("FRAME-BY-FRAME DESCRIPTIONS:\n")
            f.write("="*80 + "\n")
            f.write(combined + "\n\n")
            f.write("="*80 + "\n")
            f.write("OVERALL SCENE OVERVIEW:\n")
            f.write("="*80 + "\n")
            f.write(scene_overview + "\n")
        print(f"💾 Complete analysis saved to {output_file}")
    
    return {
        'frame_data': frame_data,
        'combined_descriptions': combined,
        'scene_overview': scene_overview
    }


def main():
    """Main execution function for CLI usage."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Complete video analysis: frame analysis + scene overview'
    )
    parser.add_argument(
        'video_path',
        help='Path to the video file to analyze'
    )
    parser.add_argument(
        '--fps',
        type=float,
        default=4.0,
        help='Frames per second to sample (default: 4.0)'
    )
    parser.add_argument(
        '--batch-size',
        type=int,
        default=8,
        help='Number of frames to process per batch (default: 8)'
    )
    parser.add_argument(
        '--save-intermediate',
        action='store_true',
        help='Save intermediate frame analysis to JSONL file'
    )
    parser.add_argument(
        '--no-save-final',
        action='store_true',
        help='Do not save final analysis to text file'
    )
    parser.add_argument(
        '--model',
        default='gemini-2.0-flash-exp',
        help='Gemini model to use (default: gemini-2.0-flash-exp)'
    )
    
    args = parser.parse_args()
    
    # Check if video file exists
    if not os.path.exists(args.video_path):
        print(f"❌ Error: Video file '{args.video_path}' not found!")
        return 1
    
    try:
        result = analyze_video_complete(
            video_path=args.video_path,
            fps=args.fps,
            batch_size=args.batch_size,
            save_intermediate=args.save_intermediate,
            save_final=not args.no_save_final,
            model=args.model
        )
        print("\n✨ Analysis complete!")
        return 0
        
    except Exception as e:
        print(f"\n❌ Error during analysis: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())

