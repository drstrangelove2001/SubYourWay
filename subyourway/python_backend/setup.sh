#!/bin/bash
# Setup script for Python backend

echo "Setting up Python environment for Demucs..."

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

echo "Python backend setup complete!"
echo "To activate the environment, run: source python_backend/venv/bin/activate"

