# 🎉 Audio Extraction Feature - Update

## What's New?

The audio removal tool now **extracts and saves the audio file** by default! Instead of just deleting the audio, you now get:

1. 🎬 **Silent video** (video without audio)
2. 🔊 **Extracted audio file** (saved separately)

## Key Changes

### ✅ Audio is Now Saved by Default

**Before:**
```bash
python remove_audio.py video.mp4
# Result: video_no_audio.mp4 (audio was deleted)
```

**Now:**
```bash
python remove_audio.py video.mp4
# Result: 
#   - video_no_audio.mp4 (silent video)
#   - video_audio.mp3 (extracted audio)
```

### 🎵 Multiple Audio Formats Supported

You can now choose the format for the extracted audio:

```bash
# MP3 (default)
python remove_audio.py video.mp4

# WAV
python remove_audio.py video.mp4 --audio-format wav

# AAC
python remove_audio.py video.mp4 --audio-format aac

# M4A
python remove_audio.py video.mp4 --audio-format m4a

# FLAC (lossless)
python remove_audio.py video.mp4 --audio-format flac

# OGG Vorbis
python remove_audio.py video.mp4 --audio-format ogg
```

### 🚫 Option to Not Save Audio

If you want the old behavior (just remove audio without saving):

```bash
python remove_audio.py video.mp4 --no-save-audio
```

## Usage Examples

### Example 1: Extract Audio as MP3 (Default)

```bash
python remove_audio.py video.mp4 --method ffmpeg
```

**Output:**
- `video_no_audio.mp4` - Silent video
- `video_audio.mp3` - Extracted audio

### Example 2: Extract Audio as High-Quality WAV

```bash
python remove_audio.py video.mp4 --method ffmpeg --audio-format wav
```

**Output:**
- `video_no_audio.mp4` - Silent video
- `video_audio.wav` - Extracted audio (uncompressed)

### Example 3: Batch Process with Audio Extraction

```bash
python batch_remove_audio.py videos/ --method ffmpeg --audio-format mp3
```

**Output:**
- `videos/no_audio/video1_no_audio.mp4` + `video1_audio.mp3`
- `videos/no_audio/video2_no_audio.mp4` + `video2_audio.mp3`
- ...

### Example 4: Python Code with Audio Extraction

```python
from remove_audio import AudioRemover

# Extract audio as MP3
remover = AudioRemover(
    video_path="video.mp4",
    method="ffmpeg",
    save_audio=True,
    audio_format="mp3"
)

remover.remove_audio()

print(f"Video saved to: {remover.output_path}")
print(f"Audio saved to: {remover.audio_path}")
```

### Example 5: Don't Save Audio (Old Behavior)

```python
from remove_audio import AudioRemover

# Just remove audio, don't save it
remover = AudioRemover(
    video_path="video.mp4",
    method="ffmpeg",
    save_audio=False
)

remover.remove_audio()
```

## Updated Parameters

### AudioRemover Class

```python
AudioRemover(
    video_path: str,
    output_path: str = None,
    method: str = "moviepy",
    save_audio: bool = True,        # NEW!
    audio_format: str = "mp3"       # NEW!
)
```

### Command-Line Arguments

```bash
python remove_audio.py [video] [options]

Options:
  -m, --method          Method: moviepy or ffmpeg
  -o, --output          Custom output path for video
  -f, --audio-format    Audio format: mp3, wav, aac, m4a, ogg, flac
  --no-save-audio       Don't save extracted audio
  --info                Show file information
```

## Supported Audio Formats

| Format | Extension | Codec | Quality | Use Case |
|--------|-----------|-------|---------|----------|
| MP3 | .mp3 | libmp3lame | Good | General use, small size |
| WAV | .wav | PCM | Perfect | Lossless, editing |
| AAC | .aac | AAC | Good | Modern, efficient |
| M4A | .m4a | AAC | Good | Apple devices |
| FLAC | .flac | FLAC | Perfect | Lossless, archival |
| OGG | .ogg | Vorbis | Good | Open source |

## REST API Updates

### Upload and Extract Audio

```javascript
const formData = new FormData();
formData.append('file', videoFile);
formData.append('method', 'ffmpeg');
formData.append('save_audio', 'true');      // NEW!
formData.append('audio_format', 'mp3');     // NEW!

const response = await fetch('http://localhost:5000/api/remove-audio', {
    method: 'POST',
    body: formData
});

const result = await response.json();
console.log('Video:', result.video_download_url);
console.log('Audio:', result.audio_download_url);  // NEW!
```

### API Response Format

```json
{
  "status": "success",
  "message": "Audio extracted and removed successfully",
  "video_filename": "video_no_audio.mp4",
  "video_download_url": "/api/download/video_no_audio.mp4",
  "audio_filename": "video_audio.mp3",
  "audio_download_url": "/api/download/video_audio.mp3",
  "audio_size_mb": 3.45,
  "audio_format": "mp3",
  "size_info": {
    "original_mb": 25.6,
    "new_mb": 22.1,
    "reduction_mb": 3.5
  }
}
```

## File Naming Convention

| Input | Video Output | Audio Output |
|-------|-------------|--------------|
| `video.mp4` | `video_no_audio.mp4` | `video_audio.mp3` |
| `movie.avi` | `movie_no_audio.avi` | `movie_audio.mp3` |
| `clip.mkv` | `clip_no_audio.mkv` | `clip_audio.wav` |

## Use Cases

### 1. Audio-Video Separation for Editing

```bash
# Extract audio for separate editing
python remove_audio.py video.mp4 --audio-format wav
# Edit audio separately, then recombine
```

### 2. Format Conversion

```bash
# Extract audio from video to MP3
python remove_audio.py video.mkv --audio-format mp3
```

### 3. Backup Original Audio

```bash
# Save original audio before dubbing
python remove_audio.py original.mp4 --audio-format flac
# Now add new language audio to the silent video
```

### 4. Create Silent Videos with Audio Archive

```bash
# Batch process and keep all audio files
python batch_remove_audio.py videos/ --audio-format mp3
```

## Performance Tips

1. **Use MP3 for general use** - Good quality, small size
2. **Use WAV for editing** - No quality loss
3. **Use FLAC for archival** - Lossless, better compression than WAV
4. **Use AAC for mobile** - Modern, efficient codec
5. **Use FFmpeg method** - Much faster than moviepy

## File Size Comparison

Example: 1 hour video with stereo audio

| Format | Bitrate | File Size | Quality |
|--------|---------|-----------|---------|
| MP3 | 128 kbps | ~56 MB | Good |
| MP3 | 320 kbps | ~138 MB | Excellent |
| AAC | 128 kbps | ~56 MB | Better than MP3 |
| WAV | 1411 kbps | ~605 MB | Perfect |
| FLAC | ~700 kbps | ~300 MB | Perfect |
| OGG | 128 kbps | ~56 MB | Good |

## Migration Guide

### If You Were Using the Old Version

**Old code (audio was deleted):**
```python
remover = AudioRemover("video.mp4", method="ffmpeg")
remover.remove_audio()
```

**New code (audio is now saved):**
```python
# Default behavior - saves audio as MP3
remover = AudioRemover("video.mp4", method="ffmpeg")
remover.remove_audio()
# Now you have both video_no_audio.mp4 AND video_audio.mp3

# To get old behavior (don't save audio):
remover = AudioRemover("video.mp4", method="ffmpeg", save_audio=False)
remover.remove_audio()
```

## Backward Compatibility

✅ **Fully backward compatible!**

- Existing code will work without changes
- Audio is now saved by default (bonus feature!)
- Use `save_audio=False` to get old behavior

## Quick Command Reference

```bash
# Basic (saves audio as MP3)
python remove_audio.py video.mp4

# With specific audio format
python remove_audio.py video.mp4 -f wav

# Don't save audio
python remove_audio.py video.mp4 --no-save-audio

# Batch with audio extraction
python batch_remove_audio.py videos/ -f mp3

# Show all info
python remove_audio.py video.mp4 --info

# FFmpeg (fast) with AAC audio
python remove_audio.py video.mp4 -m ffmpeg -f aac
```

## Updated Web Interface

The web interface now shows:
- ✅ Download button for silent video
- ✅ Download button for extracted audio
- ✅ Audio file size and format
- ✅ Both files available for download

Open `api_client_example.html` after starting the API server to see the updated interface!

## Benefits

1. **Keep Original Audio** - Don't lose the audio when removing it
2. **Audio Backup** - Archive audio separately
3. **Audio Reuse** - Use extracted audio in other projects
4. **Format Flexibility** - Choose the best format for your needs
5. **No Data Loss** - Both video and audio are preserved

## Questions & Answers

**Q: Will this double my storage usage?**
A: Only slightly. Audio is typically 5-10% of video file size.

**Q: Can I extract audio without creating the silent video?**
A: Currently, both are created. You can delete the video afterward if not needed.

**Q: Which format should I use?**
A: MP3 for general use, WAV for editing, FLAC for archival.

**Q: Does this work with batch processing?**
A: Yes! All features work with `batch_remove_audio.py`.

**Q: Can I disable audio extraction?**
A: Yes, use `--no-save-audio` flag.

## Summary

🎉 **What You Get:**
- Silent video file
- Extracted audio file  
- Choice of 6 audio formats
- Backward compatibility
- Works with all methods (CLI, Python, API)

🚀 **Start Using:**
```bash
python remove_audio.py your_video.mp4 --method ffmpeg
```

**You'll get:**
- `your_video_no_audio.mp4` 🎬
- `your_video_audio.mp3` 🔊

