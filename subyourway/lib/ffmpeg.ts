import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

// Set ffmpeg path if needed (you may need to adjust this based on your installation)
// ffmpeg.setFfmpegPath('/path/to/ffmpeg');

export interface ExtractAudioOptions {
  videoPath: string;
  outputPath: string;
}

export interface MergeAudioOptions {
  videoPath: string;
  audioPath: string;
  outputPath: string;
}

export interface MixAudioOptions {
  vocalsPath: string;
  backgroundPath: string;
  outputPath: string;
  vocalsVolume?: number; // 0.0 to 1.0
  backgroundVolume?: number; // 0.0 to 1.0
}

/**
 * Extract audio from video file
 */
export function extractAudio(options: ExtractAudioOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`Extracting audio from: ${options.videoPath}`);
    
    ffmpeg(options.videoPath)
      .output(options.outputPath)
      .audioCodec('pcm_s16le')
      .audioChannels(2)
      .audioFrequency(44100)
      .format('wav')
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`Processing: ${progress.percent?.toFixed(2)}% done`);
      })
      .on('end', () => {
        console.log('Audio extraction completed');
        resolve(options.outputPath);
      })
      .on('error', (err) => {
        console.error('Error extracting audio:', err);
        reject(err);
      })
      .run();
  });
}

/**
 * Mix vocals with background music
 */
export function mixAudio(options: MixAudioOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`Mixing vocals and background audio`);
    
    const vocalsVolume = options.vocalsVolume ?? 1.0;
    const backgroundVolume = options.backgroundVolume ?? 0.7;
    
    // Use complex filter to mix audio with volume control
    ffmpeg()
      .input(options.vocalsPath)
      .input(options.backgroundPath)
      .complexFilter([
        `[0:a]volume=${vocalsVolume}[a1]`,
        `[1:a]volume=${backgroundVolume}[a2]`,
        '[a1][a2]amix=inputs=2:duration=longest:dropout_transition=2[aout]'
      ])
      .outputOptions([
        '-map', '[aout]',
        '-ac', '2',
        '-ar', '44100'
      ])
      .audioCodec('pcm_s16le')
      .format('wav')
      .output(options.outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg mix command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`Mixing: ${progress.percent?.toFixed(2)}% done`);
      })
      .on('end', () => {
        console.log('Audio mixing completed');
        resolve(options.outputPath);
      })
      .on('error', (err) => {
        console.error('Error mixing audio:', err);
        reject(err);
      })
      .run();
  });
}

/**
 * Merge audio back into video (replacing original audio)
 */
export function mergeAudioToVideo(options: MergeAudioOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`Merging audio back to video`);
    
    ffmpeg()
      .input(options.videoPath)
      .input(options.audioPath)
      .outputOptions([
        '-map', '0:v',  // Video from first input
        '-map', '1:a',  // Audio from second input
        '-c:v', 'copy',  // Copy video codec (no re-encoding)
        '-c:a', 'aac',   // Encode audio to AAC
        '-b:a', '192k',  // Audio bitrate
        '-shortest'      // Match duration to shortest input
      ])
      .output(options.outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg merge command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`Merging: ${progress.percent?.toFixed(2)}% done`);
      })
      .on('end', () => {
        console.log('Video merge completed');
        resolve(options.outputPath);
      })
      .on('error', (err) => {
        console.error('Error merging video:', err);
        reject(err);
      })
      .run();
  });
}

/**
 * Get video duration in seconds
 */
export function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const duration = metadata.format.duration || 0;
        resolve(duration);
      }
    });
  });
}

/**
 * Get video information
 */
export function getVideoInfo(videoPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata);
      }
    });
  });
}

export interface EmbedSubtitlesOptions {
  videoPath: string;
  subtitlePath: string;
  outputPath: string;
  fontName?: string;
  fontSize?: number;
  fontColor?: string;
  outlineColor?: string;
  position?: 'bottom' | 'top';
}

/**
 * Embed subtitles directly into video (burn-in)
 */
export function embedSubtitles(options: EmbedSubtitlesOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`Embedding subtitles into video...`);
    
    const fontSize = options.fontSize || 24;
    const fontColor = options.fontColor || 'white';
    const outlineColor = options.outlineColor || 'black';
    const position = options.position || 'bottom';
    
    // Margin from bottom/top
    const marginV = position === 'bottom' ? 50 : 20;
    const alignment = position === 'bottom' ? 2 : 8; // 2 = bottom center, 8 = top center
    
    // On Windows, FFmpeg needs forward slashes but with colon escaping
    // First normalize to forward slashes, then escape colons
    let subtitlePathEscaped = options.subtitlePath.replace(/\\/g, '/');
    subtitlePathEscaped = subtitlePathEscaped.replace(/:/g, '\\\\:');
    
    // ASS subtitle style configuration
    const subtitleFilter = `subtitles=${subtitlePathEscaped}:force_style='FontName=Arial,FontSize=${fontSize},PrimaryColour=&H${rgbToAss(fontColor)},OutlineColour=&H${rgbToAss(outlineColor)},BorderStyle=1,Outline=2,Shadow=1,MarginV=${marginV},Alignment=${alignment}'`;
    
    ffmpeg(options.videoPath)
      .videoFilters(subtitleFilter)
      .videoCodec('libx264')  // Re-encode video with subtitles
      .audioCodec('copy')     // Copy audio without re-encoding
      .outputOptions([
        '-preset', 'fast',    // Faster encoding
        '-crf', '23',         // Quality (lower = better, 18-28 is good range)
      ])
      .output(options.outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg subtitle command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`Embedding subtitles: ${progress.percent?.toFixed(2)}% done`);
      })
      .on('end', () => {
        console.log('Subtitle embedding completed');
        resolve(options.outputPath);
      })
      .on('error', (err) => {
        console.error('Error embedding subtitles:', err);
        reject(err);
      })
      .run();
  });
}

/**
 * Add soft subtitles (can be toggled on/off by user)
 */
export function addSoftSubtitles(options: {
  videoPath: string;
  subtitlePath: string;
  outputPath: string;
  language?: string;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`Adding soft subtitles to video...`);
    
    const language = options.language || 'eng';
    
    ffmpeg(options.videoPath)
      .input(options.subtitlePath)
      .outputOptions([
        '-c', 'copy', // Copy all streams
        '-c:s', 'mov_text', // Subtitle codec for MP4
        `-metadata:s:s:0`, `language=${language}`,
        `-metadata:s:s:0`, `title=Singlish`
      ])
      .output(options.outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg subtitle command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`Adding subtitles: ${progress.percent?.toFixed(2)}% done`);
      })
      .on('end', () => {
        console.log('Soft subtitle addition completed');
        resolve(options.outputPath);
      })
      .on('error', (err) => {
        console.error('Error adding soft subtitles:', err);
        reject(err);
      })
      .run();
  });
}

/**
 * Convert RGB color name to ASS format
 */
function rgbToAss(color: string): string {
  const colors: Record<string, string> = {
    'white': 'FFFFFF',
    'black': '000000',
    'yellow': 'FFFF00',
    'red': 'FF0000',
    'blue': '0000FF',
    'green': '00FF00',
  };
  
  return colors[color.toLowerCase()] || 'FFFFFF';
}

