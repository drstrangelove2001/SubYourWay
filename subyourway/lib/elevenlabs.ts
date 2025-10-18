import axios from 'axios';
import fs from 'fs';
import path from 'path';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Default voice ID (Rachel - natural sounding female voice)
// You can change this to any other voice ID from ElevenLabs
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

export interface TTSOptions {
  text: string;
  voiceId?: string;
  outputPath: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speakerBoost?: boolean;
}

export interface TTSSegment {
  text: string;
  start: number;
  end: number;
  audioPath: string;
}

/**
 * Convert text to speech using ElevenLabs API
 */
export async function textToSpeech(options: TTSOptions): Promise<string> {
  try {
    const voiceId = options.voiceId || DEFAULT_VOICE_ID;
    
    console.log(`Generating speech with ElevenLabs (voice: ${voiceId})...`);
    
    const response = await axios.post(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        text: options.text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: options.stability ?? 0.5,
          similarity_boost: options.similarityBoost ?? 0.75,
          style: options.style ?? 0.0,
          use_speaker_boost: options.speakerBoost ?? true,
        },
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        responseType: 'arraybuffer',
      }
    );
    
    // Save audio file
    fs.writeFileSync(options.outputPath, response.data);
    console.log(`Speech generated and saved to: ${options.outputPath}`);
    
    return options.outputPath;
  } catch (error: any) {
    console.error('Error generating speech:', error.response?.data || error.message);
    throw new Error(`Text-to-speech failed: ${error.response?.data?.detail?.message || error.message}`);
  }
}

/**
 * Generate speech for multiple segments
 */
export async function generateSegmentAudio(
  segments: Array<{ text: string; start: number; end: number }>,
  outputDir: string,
  voiceId?: string
): Promise<TTSSegment[]> {
  try {
    console.log(`Generating audio for ${segments.length} segments...`);
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const ttsSegments: TTSSegment[] = [];
    
    // Generate audio for each segment
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      
      // Validate segment has text
      if (!segment.text || segment.text.trim() === '') {
        console.warn(`Skipping segment ${i + 1}: empty or undefined text`);
        continue;
      }
      
      const outputPath = path.join(outputDir, `segment_${i.toString().padStart(4, '0')}.mp3`);
      
      const previewText = segment.text.length > 50 ? segment.text.substring(0, 50) + '...' : segment.text;
      console.log(`Generating segment ${i + 1}/${segments.length}: "${previewText}"`);
      
      try {
        await textToSpeech({
          text: segment.text,
          voiceId,
          outputPath,
        });
        
        ttsSegments.push({
          text: segment.text,
          start: segment.start,
          end: segment.end,
          audioPath: outputPath,
        });
      } catch (error: any) {
        console.error(`Failed to generate segment ${i + 1}:`, error.message);
        // Continue with next segment instead of failing completely
      }
      
      // Rate limiting: wait a bit between requests to avoid hitting API limits
      if (i < segments.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (ttsSegments.length === 0) {
      throw new Error('No audio segments were successfully generated');
    }
    
    console.log(`Generated audio for ${ttsSegments.length} segments`);
    return ttsSegments;
  } catch (error: any) {
    console.error('Error generating segment audio:', error);
    throw new Error(`Segment audio generation failed: ${error.message}`);
  }
}

/**
 * Get available voices from ElevenLabs
 */
export async function getAvailableVoices(): Promise<any[]> {
  try {
    const response = await axios.get(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });
    
    return response.data.voices;
  } catch (error: any) {
    console.error('Error fetching voices:', error);
    throw new Error(`Failed to fetch voices: ${error.message}`);
  }
}

/**
 * Concatenate multiple audio segments into one file
 */
export async function concatenateAudioSegments(
  segmentPaths: string[],
  outputPath: string
): Promise<string> {
  try {
    console.log(`Concatenating ${segmentPaths.length} audio segments...`);
    
    // We'll need to use ffmpeg for this
    // For now, return the first segment path as a placeholder
    // This will be implemented in the full processing pipeline
    
    return outputPath;
  } catch (error: any) {
    console.error('Error concatenating audio:', error);
    throw new Error(`Audio concatenation failed: ${error.message}`);
  }
}

