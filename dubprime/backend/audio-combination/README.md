# Audio Combination & Video Merging

This tool combines your dubbed audio with the original background music and merges it back with the video.

## Prerequisites

```bash
pip install demucs
```

Also requires ffmpeg to be installed and available in PATH.

## Usage

### Option 1: Auto-separate and combine (Recommended)

```bash
python combine_and_merge.py original_video.mp4 dubbed_audio.mp3 --separate output_dubbed.mp4
```

This will:
1. Use Demucs to separate vocals from background music
2. Combine your dubbed audio with the background music
3. Merge everything back into the video

### Option 2: With pre-separated audio

If you already have the background audio separated:

```bash
python combine_and_merge.py original_video.mp4 dubbed_audio.mp3 background_audio.wav output_dubbed.mp4
```

## Complete Workflow Example

```bash
# 1. Generate dubbed audio from SRT file
cd ../audio-generation
python dub_srt.py singlish_subtitles.srt

# 2. Combine and merge with video
cd ../audio-combination
python combine_and_merge.py original_singlish_subs.mov ../audio-generation/singlish_subtitles_audio/combined_audio.mp3 --separate final_dubbed_video.mp4
```

## Audio Levels

The script sets:
- **Dubbed audio (voice)**: Volume 1.2 (louder, clear voice)
- **Background music**: Volume 0.4 (quieter, background)

You can adjust these in the script by modifying the volume values in the `-filter_complex` parameter.

