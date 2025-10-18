import fs from 'fs';

export interface SubtitleSegment {
  index: number;
  startTime: string;
  endTime: string;
  text: string;
}

/**
 * Convert seconds to SRT timestamp format (HH:MM:SS,mmm)
 */
function secondsToSrtTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds
    .toString()
    .padStart(3, '0')}`;
}

/**
 * Generate SRT subtitle file content
 */
export function generateSRT(
  segments: Array<{ start: number; end: number; text: string }>
): string {
  let srtContent = '';

  segments.forEach((segment, index) => {
    const startTime = secondsToSrtTime(segment.start);
    const endTime = secondsToSrtTime(segment.end);

    srtContent += `${index + 1}\n`;
    srtContent += `${startTime} --> ${endTime}\n`;
    srtContent += `${segment.text}\n\n`;
  });

  return srtContent.trim();
}

/**
 * Save SRT subtitle file
 */
export function saveSRT(
  segments: Array<{ start: number; end: number; text: string }>,
  outputPath: string
): void {
  const srtContent = generateSRT(segments);
  fs.writeFileSync(outputPath, srtContent, 'utf-8');
  console.log(`Subtitles saved to: ${outputPath}`);
}

/**
 * Generate dual subtitles (original + translation)
 */
export function generateDualSRT(
  segments: Array<{ start: number; end: number; original: string; translated: string }>
): string {
  let srtContent = '';

  segments.forEach((segment, index) => {
    const startTime = secondsToSrtTime(segment.start);
    const endTime = secondsToSrtTime(segment.end);

    srtContent += `${index + 1}\n`;
    srtContent += `${startTime} --> ${endTime}\n`;
    srtContent += `${segment.translated}\n`;
    srtContent += `${segment.original}\n\n`; // Original as second line
  });

  return srtContent.trim();
}

/**
 * Save dual subtitles file
 */
export function saveDualSRT(
  segments: Array<{ start: number; end: number; original: string; translated: string }>,
  outputPath: string
): void {
  const srtContent = generateDualSRT(segments);
  fs.writeFileSync(outputPath, srtContent, 'utf-8');
  console.log(`Dual subtitles saved to: ${outputPath}`);
}

