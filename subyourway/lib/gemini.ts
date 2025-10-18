import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface TranslationSegment {
  original: string;
  translated: string;
  start: number;
  end: number;
}

/**
 * Translate text to Singlish using Gemini API
 */
export async function translateToSinglish(text: string): Promise<string> {
  try {
    console.log('Translating to Singlish...');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are an expert in Singlish (Singaporean English). You will be given dialogues from a movie/tv in the form of text. Translate the following text into natural, authentic Singlish while preserving the meaning and tone. Use common Singlish expressions, particles like "lah", "leh", "lor", "meh", "sia", and colloquialisms where appropriate. Make it sound like a natural Singaporean speaking.
If there are any foreign phrases, try to use some Singaporean analogies/metaphors/jokes so that a Singaporean viewer can understand the meaning, but don't force it.
Text to translate:
${text}

Singlish translation:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();
    
    console.log('Translation completed');
    return translatedText.trim();
  } catch (error: any) {
    console.error('Error translating to Singlish:', error);
    throw new Error(`Translation failed: ${error.message}`);
  }
}

/**
 * Translate multiple segments to Singlish with timing preservation
 */
export async function translateSegments(segments: Array<{text: string, start: number, end: number}>): Promise<TranslationSegment[]> {
  try {
    console.log(`Translating ${segments.length} segments to Singlish...`);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Batch translate for efficiency
    const textsToTranslate = segments.map((seg, idx) => `${idx + 1}. ${seg.text}`).join('\n');
    
    const prompt = `You are an expert in Singlish (Singaporean English) trying to translate a foreign slang/language into Singlish for Singaporeans. You will be given dialogues from a movie/tv in numbered lines. Translate each numbered line into strong, natural, authentic Singlish while preserving the meaning and tone. Use common Singlish expressions, particles like "lah", "leh", "lor", "meh", "sia", and colloquialisms where appropriate.
If there are any phrases foreign to Singapore, try to use some Singaporean analogies/metaphors/jokes so that a Singaporean viewer can completely relate to and understand the meaning, but don't force it.
    IMPORTANT: Return ONLY the numbered translations, one per line, maintaining the same numbering. Do not add any explanations or extra text.

Lines to translate:
${textsToTranslate}

Singlish translations:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();
    
    // Parse the numbered responses
    const translatedLines = translatedText.split('\n').filter(line => line.trim());
    
    const translationSegments: TranslationSegment[] = segments.map((seg, idx) => {
      // Try to find the corresponding translation
      let translated = seg.text; // fallback to original
      
      for (const line of translatedLines) {
        // Match numbered line
        const match = line.match(/^(\d+)\.\s*(.+)$/);
        if (match && parseInt(match[1]) === idx + 1) {
          translated = match[2].trim();
          break;
        }
      }
      
      return {
        original: seg.text,
        translated,
        start: seg.start,
        end: seg.end,
      };
    });
    
    console.log(`Translated ${translationSegments.length} segments`);
    return translationSegments;
  } catch (error: any) {
    console.error('Error translating segments:', error);
    throw new Error(`Segment translation failed: ${error.message}`);
  }
}

/**
 * Translate text with context awareness
 */
export async function translateWithContext(
  currentText: string,
  previousContext?: string,
  nextContext?: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    let prompt = `You are an expert in Singlish (Singaporean English). Translate the following text into natural, authentic Singlish.`;
    
    if (previousContext || nextContext) {
      prompt += `\n\nFor context:`;
      if (previousContext) prompt += `\nPrevious line: "${previousContext}"`;
      if (nextContext) prompt += `\nNext line: "${nextContext}"`;
    }
    
    prompt += `\n\nText to translate: "${currentText}"\n\nSinglish translation (just the translation, no explanation):`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text().trim();
  } catch (error: any) {
    console.error('Error in context-aware translation:', error);
    throw new Error(`Context translation failed: ${error.message}`);
  }
}

