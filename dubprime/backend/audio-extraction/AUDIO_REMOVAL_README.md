# Audio Removal Tool

Remove audio tracks from video files programmatically. This tool provides two methods for audio removal: moviepy (Python library) and FFmpeg (command-line tool).

## Features

- 🎥 **Multiple Methods**: Choose between moviepy or FFmpeg
- 📁 **Batch Processing**: Process multiple videos at once
- 🚀 **Fast Processing**: FFmpeg method uses stream copy (no re-encoding)
- 💾 **Auto-naming**: Automatically generates output filenames
- 📊 **File Information**: View file sizes and reduction stats
- ✅ **Error Handling**: Robust error handling and user feedback

## Installation

### Method 1: moviepy (Python Library)

```bash
pip install moviepy
```

### Method 2: FFmpeg (Recommended for speed)

**Windows:**
1. Download from [ffmpeg.org](https://ffmpeg.org/download.html)
2. Extract and add to PATH

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg  # Ubuntu/Debian
sudo yum install ffmpeg      # CentOS/RHEL
```

## Usage

### Single Video Processing

#### Basic Usage (moviepy)
```bash
python remove_audio.py input.mp4
```
Output: `input_no_audio.mp4` (in same directory)

#### Using FFmpeg (faster)
```bash
python remove_audio.py input.mp4 --method ffmpeg
```

#### Custom Output Path
```bash
python remove_audio.py input.mp4 --output silent_video.mp4
```

#### Show File Information
```bash
python remove_audio.py input.mp4 --info
```

### Batch Processing

#### Process All Videos in Directory
```bash
python batch_remove_audio.py videos/
```
Output: `videos/no_audio/` directory with processed files

#### Custom Output Directory
```bash
python batch_remove_audio.py videos/ --output processed/
```

#### Recursive Processing (including subdirectories)
```bash
python batch_remove_audio.py videos/ --recursive
```

#### Batch with FFmpeg
```bash
python batch_remove_audio.py videos/ --method ffmpeg
```

## Command-Line Options

### remove_audio.py

| Option | Description |
|--------|-------------|
| `video` | Path to input video file (required) |
| `-o, --output` | Path to output video file (optional) |
| `-m, --method` | Method: `moviepy` or `ffmpeg` (default: moviepy) |
| `--info` | Show file information after processing |

### batch_remove_audio.py

| Option | Description |
|--------|-------------|
| `input_dir` | Directory containing video files (required) |
| `-o, --output` | Output directory (default: creates `no_audio` subfolder) |
| `-m, --method` | Method: `moviepy` or `ffmpeg` (default: moviepy) |
| `-r, --recursive` | Search subdirectories recursively |

## Supported Video Formats

- `.mp4` - MP4
- `.avi` - AVI
- `.mov` - QuickTime
- `.mkv` - Matroska
- `.flv` - Flash Video
- `.wmv` - Windows Media Video
- `.webm` - WebM

## Python API Usage

### Single Video

```python
from remove_audio import AudioRemover

# Using moviepy
remover = AudioRemover("input.mp4", method="moviepy")
success = remover.remove_audio()

# Using FFmpeg with custom output
remover = AudioRemover(
    video_path="input.mp4",
    output_path="output.mp4",
    method="ffmpeg"
)
success = remover.remove_audio()

# Get file information
if success:
    info = remover.get_file_info()
    print(f"Size reduction: {info['size_reduction_mb']:.2f} MB")
```

### Batch Processing

```python
from batch_remove_audio import process_batch

# Process directory
results = process_batch(
    input_dir="videos/",
    output_dir="processed/",
    method="ffmpeg",
    recursive=True
)

print(f"Success: {results['success']}/{results['total']}")
```

## Method Comparison

| Feature | moviepy | FFmpeg |
|---------|---------|--------|
| **Speed** | Slower (re-encodes video) | Fast (stream copy) |
| **Quality** | May reduce quality | Preserves original quality |
| **Installation** | `pip install moviepy` | Requires separate installation |
| **Dependencies** | Python only | External binary |
| **Best for** | Simple tasks, Python-only environments | Production, batch processing |

## Examples

### Example 1: Remove audio from a single video
```bash
python remove_audio.py sample.mp4 --method ffmpeg --info
```

### Example 2: Process all videos in a project
```bash
python batch_remove_audio.py ../clips/ --output ../processed/ --method ffmpeg
```

### Example 3: Python integration
```python
from remove_audio import AudioRemover

def process_uploaded_video(video_path):
    """Remove audio from uploaded video."""
    try:
        remover = AudioRemover(video_path, method="ffmpeg")
        if remover.remove_audio():
            return str(remover.output_path)
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

# Usage
output = process_uploaded_video("uploads/video.mp4")
if output:
    print(f"Processed video saved to: {output}")
```

## Troubleshooting

### moviepy not found
```bash
pip install moviepy
```

### FFmpeg not found
Ensure FFmpeg is installed and added to your system PATH.

Test with:
```bash
ffmpeg -version
```

### Video has no audio
The tool will detect if a video already has no audio track and notify you.

### Permission errors
Ensure you have write permissions in the output directory.

## Integration with DubPrime

This tool can be integrated into the DubPrime workflow:

1. **Pre-dubbing**: Remove original audio before adding new dubs
2. **Audio replacement**: Clean slate for subtitle burn-in
3. **Silent previews**: Create silent versions for editing

### Example Integration

```python
from remove_audio import AudioRemover
from analyze_video_complete import analyze_video

# 1. Remove original audio
remover = AudioRemover("input.mp4", method="ffmpeg")
remover.remove_audio()

# 2. Analyze video for context
analysis = analyze_video(str(remover.output_path))

# 3. Add subtitles/dubs to silent video
# ... your dubbing logic here
```

## Performance Tips

1. **Use FFmpeg for batch processing** - Much faster than moviepy
2. **Avoid re-encoding** - FFmpeg's stream copy preserves quality
3. **Process in parallel** - For multiple videos, consider multiprocessing
4. **Use SSD storage** - Faster read/write speeds

## License

MIT License - Same as DubPrime project

