# pip install demucs

import subprocess

# Separate audio from video
subprocess.run([
    "demucs", 
    "--two-stems=vocals",  # Separates into vocals and background
    "english.mp4"
])

# Output: separated/model_name/input_video/vocals.wav and no_vocals.wav