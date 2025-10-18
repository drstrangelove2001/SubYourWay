import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface TranscriptionResult {
  text: string;
  segments: TranscriptionSegment[];
  language: string;
  duration: number;
}

/**
 * Transcribe audio using OpenAI Whisper API with timestamps
 */
export async function transcribeAudio(audioPath: string): Promise<TranscriptionResult> {
  try {
    console.log(`Transcribing audio: ${audioPath}`);
    
    // Check file size (Whisper API has 25MB limit)
    const stats = fs.statSync(audioPath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    
    if (fileSizeInMB > 25) {
      throw new Error(`Audio file too large (${fileSizeInMB.toFixed(2)}MB). Whisper API supports up to 25MB.`);
    }
    
    // Create read stream
    const fileStream = fs.createReadStream(audioPath);
    
    // Transcribe with word-level timestamps for better sync
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word', 'segment'],
    });
    
    console.log('Transcription completed');
    
    // Get word-level timestamps for better sync
    const words = (transcription as any).words || [];
    
    // Group words into small, readable segments (max 5 words)
    const segments: TranscriptionSegment[] = [];
    let currentSegment: any = null;
    let wordCount = 0;
    const maxWords = 5; // Max 5 words per subtitle
    const maxSegmentDuration = 5; // Max 5 seconds per subtitle
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      if (!currentSegment) {
        // Start new segment
        currentSegment = {
          start: word.start,
          end: word.end,
          text: word.word,
          wordCount: 1,
        };
        wordCount = 1;
      } else {
        const segmentDuration = word.end - currentSegment.start;
        
        // Check if we should start a new segment
        const timeSinceLastWord = word.start - currentSegment.end;
        const shouldBreak = 
          wordCount >= maxWords ||  // Max words reached
          segmentDuration > maxSegmentDuration ||  // Max duration reached
          timeSinceLastWord > 1.0;  // Long pause detected
        
        if (shouldBreak) {
          // Save current segment
          segments.push({
            id: segments.length,
            start: currentSegment.start,
            end: currentSegment.end,
            text: currentSegment.text.trim(),
          });
          
          // Start new segment
          currentSegment = {
            start: word.start,
            end: word.end,
            text: word.word,
            wordCount: 1,
          };
          wordCount = 1;
        } else {
          // Add word to current segment
          currentSegment.end = word.end;
          currentSegment.text += word.word;
          wordCount++;
        }
      }
    }
    
    // Add final segment
    if (currentSegment) {
      segments.push({
        id: segments.length,
        start: currentSegment.start,
        end: currentSegment.end,
        text: currentSegment.text.trim(),
      });
    }
    
    // Fallback to segment-level if word-level failed
    if (segments.length === 0) {
      console.log('Using segment-level timestamps as fallback');
      const segmentData = (transcription as any).segments || [];
      segments.push(...segmentData.map((seg: any, index: number) => ({
        id: index,
        start: seg.start,
        end: seg.end,
        text: seg.text.trim(),
      })));
    }
    
    const result: TranscriptionResult = {
      text: transcription.text,
      segments,
      language: transcription.language || 'unknown',
      duration: (transcription as any).duration || 0,
    };
    
    console.log(`Transcribed ${result.segments.length} segments in ${result.language} (word-level timing)`);
    
    return result;
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

/**
 * Transcribe audio and save to JSON file
 */
export async function transcribeAndSave(audioPath: string, outputJsonPath: string): Promise<TranscriptionResult> {
  const result = await transcribeAudio(audioPath);
  
  // Save to JSON
  fs.writeFileSync(outputJsonPath, JSON.stringify(result, null, 2));
  console.log(`Transcription saved to: ${outputJsonPath}`);
  
  return result;
}

