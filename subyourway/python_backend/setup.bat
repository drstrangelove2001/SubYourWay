@echo off
REM Setup script for Python backend on Windows

echo Setting up Python environment for Demucs...

REM Create virtual environment
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Upgrade pip
python -m pip install --upgrade pip

REM Install requirements
pip install -r requirements.txt

echo Python backend setup complete!
echo To activate the environment, run: python_backend\venv\Scripts\activate.bat

