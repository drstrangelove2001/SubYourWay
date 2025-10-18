import os
import sys
import pysrt
from elevenlabs.client import ElevenLabs
from pydub import AudioSegment
from dotenv import load_dotenv


def dub_srt(srt_file_path):
    """
    Generates dubbed audio for each entry in an SRT file using Eleven Labs API
    and combines them into one continuous audio file with proper timing.

    Args:
        srt_file_path (str): The path to the SRT file.
    """
    load_dotenv()
    api_key = os.getenv("ELEVEN_LABS_API_KEY")
    if not api_key:
        print("Error: ELEVEN_LABS_API_KEY not found in .env file.")
        sys.exit(1)
    
    client = ElevenLabs(api_key=api_key)

    try:
        subs = pysrt.open(srt_file_path)
    except FileNotFoundError:
        print(f"Error: SRT file not found at {srt_file_path}")
        sys.exit(1)

    output_dir = os.path.splitext(srt_file_path)[0] + "_audio"
    os.makedirs(output_dir, exist_ok=True)
    
    # Combined audio track
    combined_audio = AudioSegment.empty()
    current_time_ms = 0

    for i, sub in enumerate(subs):
        print(f"Generating audio for subtitle {i + 1}/{len(subs)}: {sub.text}")
        
        # Calculate subtitle timing in milliseconds
        start_ms = sub.start.hours * 3600000 + sub.start.minutes * 60000 + sub.start.seconds * 1000 + sub.start.milliseconds
        
        # Add silence to reach the subtitle start time
        if start_ms > current_time_ms:
            silence_duration = start_ms - current_time_ms
            combined_audio += AudioSegment.silent(duration=silence_duration)
            current_time_ms = start_ms
        
        try:
            # Generate audio using ElevenLabs
            audio_generator = client.text_to_speech.convert(
                voice_id="mbL34QDB5FptPamlgvX5",  # George voice (male, deep)
                text=sub.text,
                model_id="eleven_multilingual_v2"
            )
            
            # Collect all audio chunks into bytes
            audio_bytes = b"".join(audio_generator)
            
            # Save individual file
            temp_filename = os.path.join(output_dir, f"sub_{i + 1}.mp3")
            with open(temp_filename, "wb") as f:
                f.write(audio_bytes)
            
            # Load audio segment and add to combined track
            audio_segment = AudioSegment.from_mp3(temp_filename)
            combined_audio += audio_segment
            current_time_ms += len(audio_segment)
            
            print(f"✓ Generated audio for subtitle {i + 1}")
            
        except Exception as e:
            print(f"Error generating audio for subtitle {i + 1}: {e}")
            import traceback
            traceback.print_exc()

    # Save the combined audio file
    combined_output = os.path.join(output_dir, "combined_audio.mp3")
    combined_audio.export(combined_output, format="mp3")
    
    print(f"\n✓ All audio files saved in {output_dir}")
    print(f"✓ Combined audio saved to: {combined_output}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python dub_srt.py <path_to_srt_file>")
        sys.exit(1)
    srt_file = sys.argv[1]
    dub_srt(srt_file)
