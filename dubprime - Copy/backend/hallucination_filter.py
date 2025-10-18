"""
Whisper Hallucination Detection and Filtering
----------------------------------------------
Detect and remove common Whisper API hallucinations like repeated text.
"""

from difflib import SequenceMatcher


def is_repetitive(text, threshold=0.8):
    """
    Check if text is highly repetitive.

    Args:
        text: Text to check
        threshold: Similarity threshold (0-1)

    Returns:
        bool: True if text is repetitive
    """
    if not text or len(text) < 10:
        return False

    # Split into words
    words = text.lower().split()
    if len(words) < 3:
        return False

    # Check if too many words are repeated
    unique_words = len(set(words))
    repetition_ratio = unique_words / len(words)

    return repetition_ratio < 0.3  # If less than 30% unique words


def is_hallucination(text, previous_texts=None):
    """
    Detect if text is likely a hallucination.

    Common hallucinations:
    - Repeated phrases like "Episode 1: ..."
    - Music notation like "[Music]"
    - Repeated punctuation
    - Empty or very short segments

    Args:
        text: Text to check
        previous_texts: List of previous subtitle texts to check for repetition

    Returns:
        bool: True if likely a hallucination
    """
    if not text or not text.strip():
        return True

    text_lower = text.lower().strip()

    # Common hallucination patterns
    hallucination_patterns = [
        'episode',
        '[music]',
        '[applause]',
        '[laughter]',
        'thank you',
        'you',
        '...',
        'subtitle',
        'caption',
    ]

    # Check if text is just a hallucination pattern
    if len(text_lower.split()) <= 3:
        for pattern in hallucination_patterns:
            if pattern in text_lower and len(text_lower) < 30:
                return True

    # Check repetition with previous texts
    if previous_texts:
        last_5 = previous_texts[-5:]  # Check last 5 subtitles
        for prev_text in last_5:
            similarity = SequenceMatcher(None, text_lower, prev_text.lower()).ratio()
            if similarity > 0.85:  # 85% similar to a recent subtitle
                return True

    # Check if text is highly repetitive
    if is_repetitive(text):
        return True

    return False


def filter_hallucinations(subtitles):
    """
    Filter out hallucinated subtitles from a list.

    Args:
        subtitles: List of subtitle dicts with 'text' field

    Returns:
        list: Filtered subtitles
    """
    filtered = []
    previous_texts = []

    for sub in subtitles:
        text = sub.get('text', '')

        if not is_hallucination(text, previous_texts):
            filtered.append(sub)
            previous_texts.append(text)
        else:
            print(f"Filtered hallucination: '{text}'")

    # Re-index subtitles
    for i, sub in enumerate(filtered):
        sub['id'] = i + 1

    return filtered


def detect_silence_hallucination(segment_text, duration):
    """
    Detect if a segment is likely hallucinated during silence.

    Whisper tends to hallucinate when audio is silent or unclear.

    Args:
        segment_text: The transcribed text
        duration: Duration of the segment in seconds

    Returns:
        bool: True if likely hallucinated during silence
    """
    # Very short segments (<0.5s) with text are suspicious
    if duration < 0.5 and len(segment_text.strip()) > 5:
        return True

    # Long segments (>10s) with very little text might be silence
    words = segment_text.strip().split()
    if duration > 10 and len(words) < 3:
        return True

    return False
