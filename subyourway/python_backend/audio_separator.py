#!/usr/bin/env python3
"""
Audio separation using Demucs
This script separates vocals from instrumental/background music
"""

import sys
import os
import torch
import numpy as np
import soundfile as sf
from pathlib import Path

def separate_audio(input_path: str, output_dir: str):
    """
    Separate audio into vocals and background using Demucs
    
    Args:
        input_path: Path to input audio file
        output_dir: Directory to save separated audio files
    """
    try:
        # Import demucs
        from demucs.pretrained import get_model
        from demucs.apply import apply_model
        import torchaudio
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Load the model (htdemucs is the best quality model)
        print("Loading Demucs model...")
        model = get_model('htdemucs')
        model.eval()
        
        # Move model to GPU if available
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        model.to(device)
        print(f"Using device: {device}")
        
        # Load audio using soundfile directly to avoid torchaudio backend issues
        print(f"Loading audio from: {input_path}")
        audio_data, sr = sf.read(input_path, dtype='float32')
        
        # Convert to torch tensor and ensure correct shape [channels, samples]
        wav = torch.from_numpy(audio_data.T if audio_data.ndim > 1 else audio_data[None, :])
        
        # Resample if necessary (Demucs uses 44.1kHz)
        if sr != model.samplerate:
            print(f"Resampling from {sr}Hz to {model.samplerate}Hz")
            resampler = torchaudio.transforms.Resample(sr, model.samplerate)
            wav = resampler(wav)
            sr = model.samplerate
        
        # Ensure stereo
        if wav.shape[0] == 1:
            wav = wav.repeat(2, 1)
        elif wav.shape[0] > 2:
            wav = wav[:2]
        
        # Add batch dimension and move to device
        wav = wav.unsqueeze(0).to(device)
        
        # Apply separation
        print("Separating audio... (this may take a few minutes)")
        with torch.no_grad():
            sources = apply_model(model, wav, device=device)
        
        # sources shape: [batch, sources, channels, time]
        # Demucs outputs: drums, bass, other, vocals
        sources = sources.squeeze(0).cpu()
        
        # Extract vocals and non-vocals
        vocals = sources[3]  # vocals is the 4th source
        
        # Mix all other sources for background
        drums = sources[0]
        bass = sources[1]
        other = sources[2]
        background = drums + bass + other
        
        # Save vocals
        vocals_path = os.path.join(output_dir, "vocals.wav")
        print(f"Saving vocals to: {vocals_path}")
        sf.write(vocals_path, vocals.T.cpu().numpy(), sr)
        
        # Save background
        background_path = os.path.join(output_dir, "background.wav")
        print(f"Saving background to: {background_path}")
        sf.write(background_path, background.T.cpu().numpy(), sr)
        
        # Also save individual stems for reference
        stems_dir = os.path.join(output_dir, "stems")
        os.makedirs(stems_dir, exist_ok=True)
        
        sf.write(os.path.join(stems_dir, "drums.wav"), drums.T.cpu().numpy(), sr)
        sf.write(os.path.join(stems_dir, "bass.wav"), bass.T.cpu().numpy(), sr)
        sf.write(os.path.join(stems_dir, "other.wav"), other.T.cpu().numpy(), sr)
        
        print("Separation completed successfully!")
        print(f"Vocals: {vocals_path}")
        print(f"Background: {background_path}")
        
        return {
            "vocals": vocals_path,
            "background": background_path,
            "success": True
        }
        
    except Exception as e:
        print(f"Error during audio separation: {str(e)}", file=sys.stderr)
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python audio_separator.py <input_audio_path> <output_directory>")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_dir = sys.argv[2]
    
    if not os.path.exists(input_path):
        print(f"Error: Input file not found: {input_path}", file=sys.stderr)
        sys.exit(1)
    
    result = separate_audio(input_path, output_dir)
    
    if result["success"]:
        sys.exit(0)
    else:
        sys.exit(1)

