import io, json
from typing import List, Dict, Any
from dotenv import load_dotenv
from PIL import Image

from .utils import sample_frames, chunk_frames
import cv2

def _client():
    load_dotenv()
    import os
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("Set GEMINI_API_KEY in environment or .env")
    from google import genai
    return genai.Client(api_key=api_key)

DEFAULT_FRAME_PROMPT = (
"You are a scene context extractor for still frames, which will be used to generate context-aware subtitles and dubbing in Singaporean English dialect so that it is relatable to a Singapore-based audience. For EACH input image, respond with a compact JSON array of same length,\n"
"where each element corresponds to the respective image, with the following fields:\n"
"- vision.labels: up to 5 tags (indoor/outdoor, scene, notable objects).\n"
"- vision.time_of_day: day|night|dusk|dawn.\n"
"- vision.description: describe the scene in 1 line like how you would describe it to a Singapore-based friend in Singlish, to make it relatable to them. Feel free to use analogies and metaphors to make it more relatable.\n"
"- audio: leave empty array ([]).\n"
"Do NOT include any prose; return JSON only."
)

def _encode_image(bgr):
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    buf = io.BytesIO()
    pil.save(buf, format="JPEG", quality=90)
    return "image/jpeg", buf.getvalue()

def analyze_video_framesapi(video_path: str, fps: float = 4.0, batch_size: int = 8, model: str = "gemini-2.0-flash-exp", custom_prompt: str = None):
    client = _client()
    out = []
    for chunk in chunk_frames(sample_frames(video_path, fps=fps), batch_size=batch_size):
        prompt = custom_prompt if custom_prompt else DEFAULT_FRAME_PROMPT
        parts = [{"text": prompt}]
        for img in chunk.images_bgr:
            mime, data = _encode_image(img)
            parts.append({"inline_data": {"mime_type": mime, "data": data}})
        resp = client.models.generate_content(
            model=model,
            contents=[{"role":"user","parts": parts}],
            config={"response_mime_type":"application/json"}
        )
        # Extract text from response
        if resp.candidates and resp.candidates[0].content.parts:
            data_text = resp.candidates[0].content.parts[0].text
            data = json.loads(data_text)
        else:
            print(f"Warning: No valid response data for chunk")
            continue
            
        for i, d in enumerate(data):
            t = chunk.t_starts[i]
            out.append({
                "t_start": float(t),
                "t_end": float(t),
                **d
            })
    return out
