import { spawn } from 'child_process';
import path from 'path';

export interface PythonRunnerOptions {
  script: string;
  args: string[];
  pythonPath?: string;
}

export interface PythonRunnerResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Run a Python script and return the result
 */
export function runPythonScript(options: PythonRunnerOptions): Promise<PythonRunnerResult> {
  return new Promise((resolve, reject) => {
    const pythonPath = options.pythonPath || 'python3';
    
    console.log(`Running Python script: ${options.script} ${options.args.join(' ')}`);
    
    const pythonProcess = spawn(pythonPath, [options.script, ...options.args]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log(`[Python] ${output.trim()}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      console.error(`[Python Error] ${output.trim()}`);
    });
    
    pythonProcess.on('close', (code) => {
      const result: PythonRunnerResult = {
        success: code === 0,
        stdout,
        stderr,
        exitCode: code || 0,
      };
      
      if (code === 0) {
        console.log('Python script completed successfully');
        resolve(result);
      } else {
        console.error(`Python script failed with exit code ${code}`);
        resolve(result); // Still resolve, but with success: false
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error('Error spawning Python process:', error);
      reject(error);
    });
  });
}

/**
 * Run Demucs audio separation
 */
export async function runDemucs(inputAudioPath: string, outputDir: string): Promise<PythonRunnerResult> {
  const scriptPath = path.join(process.cwd(), 'python_backend', 'audio_separator.py');
  
  // Check if we should use venv python
  const isWindows = process.platform === 'win32';
  const venvPythonPath = isWindows
    ? path.join(process.cwd(), 'python_backend', 'venv', 'Scripts', 'python.exe')
    : path.join(process.cwd(), 'python_backend', 'venv', 'bin', 'python3');
  
  // Try venv python first, fallback to system python
  let pythonPath = 'python3';
  try {
    const fs = require('fs');
    if (fs.existsSync(venvPythonPath)) {
      pythonPath = venvPythonPath;
      console.log(`Using virtual environment Python: ${venvPythonPath}`);
    }
  } catch (e) {
    console.log('Using system Python');
  }
  
  return runPythonScript({
    script: scriptPath,
    args: [inputAudioPath, outputDir],
    pythonPath,
  });
}

