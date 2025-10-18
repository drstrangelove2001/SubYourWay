# Audio Removal Tool - Quick Reference Card

## 🚀 Installation

```bash
cd backend/video-analysis
pip install -r requirements.txt
python setup_audio_removal.py  # Verify setup
```

## ⚡ Quick Commands

### Single Video
```bash
# Basic
python remove_audio.py video.mp4

# With FFmpeg (fast)
python remove_audio.py video.mp4 --method ffmpeg

# Custom output
python remove_audio.py input.mp4 -o output.mp4

# Show info
python remove_audio.py video.mp4 --info
```

### Batch Processing
```bash
# Process directory
python batch_remove_audio.py videos/

# With custom output
python batch_remove_audio.py videos/ -o processed/

# Recursive
python batch_remove_audio.py videos/ -r

# With FFmpeg
python batch_remove_audio.py videos/ -m ffmpeg
```

### API Server
```bash
# Start server
python audio_api.py

# Then open
api_client_example.html
```

## 🐍 Python Code

### Basic Usage
```python
from remove_audio import AudioRemover

remover = AudioRemover("video.mp4", method="ffmpeg")
remover.remove_audio()
```

### With Error Handling
```python
try:
    remover = AudioRemover("video.mp4", method="ffmpeg")
    if remover.remove_audio():
        print(f"Success: {remover.output_path}")
except Exception as e:
    print(f"Error: {e}")
```

### Batch Processing
```python
from batch_remove_audio import process_batch

results = process_batch("videos/", method="ffmpeg")
print(f"{results['success']}/{results['total']} processed")
```

## 🌐 API Endpoints

```
POST /api/remove-audio     # Upload & process
GET  /api/download/<file>  # Download result
GET  /api/files            # List files
DELETE /api/files/<file>   # Delete file
```

## 📊 Method Comparison

| Feature | FFmpeg | moviepy |
|---------|--------|---------|
| Speed | ⚡⚡⚡⚡⚡ | ⚡⚡ |
| Quality | Perfect | Good |
| Install | External | pip install |

**Recommendation:** Use FFmpeg

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| moviepy not found | `pip install moviepy` |
| FFmpeg not found | Install from ffmpeg.org |
| Permission denied | Check folder permissions |
| Video has no audio | Already no audio track |

## 📁 File Structure

```
backend/video-analysis/
├── remove_audio.py          # Main module
├── batch_remove_audio.py    # Batch processing
├── audio_api.py             # REST API
├── example_usage.py         # Code examples
├── test_audio_removal.py    # Tests
├── setup_audio_removal.py   # Setup script
├── api_client_example.html  # Web UI
├── AUDIO_REMOVAL_README.md  # Full docs
├── QUICKSTART.md            # Quick start
├── AUDIO_REMOVAL_SUMMARY.md # Overview
└── QUICK_REFERENCE.md       # This file
```

## 🎯 Common Use Cases

### 1. Remove audio from one video
```bash
python remove_audio.py video.mp4 --method ffmpeg
```

### 2. Process folder of videos
```bash
python batch_remove_audio.py videos/ --method ffmpeg
```

### 3. Use in Python script
```python
from remove_audio import AudioRemover
remover = AudioRemover("video.mp4", method="ffmpeg")
remover.remove_audio()
```

### 4. Run as web service
```bash
python audio_api.py
# Open api_client_example.html in browser
```

## 💡 Pro Tips

- ✅ Always use FFmpeg for production
- ✅ Test with small videos first
- ✅ Use `--info` to see file size reduction
- ✅ Batch process for multiple videos
- ✅ Clean up output files regularly

## 🔗 Documentation

- **Quick Start:** `QUICKSTART.md`
- **Full Guide:** `AUDIO_REMOVAL_README.md`
- **Summary:** `AUDIO_REMOVAL_SUMMARY.md`
- **Examples:** `example_usage.py`
- **This Card:** `QUICK_REFERENCE.md`

## ✅ Checklist

Before using:
- [ ] Python 3.8+ installed
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] FFmpeg installed (recommended) or moviepy
- [ ] Test video available
- [ ] Write permissions in output directory

## 📞 Quick Help

```bash
# Help for single video
python remove_audio.py --help

# Help for batch
python batch_remove_audio.py --help

# Verify setup
python setup_audio_removal.py

# Run tests
python test_audio_removal.py
```

---

**Need more details?** See `QUICKSTART.md` or `AUDIO_REMOVAL_README.md`

