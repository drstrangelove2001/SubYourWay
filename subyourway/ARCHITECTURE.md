# 🏗️ System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE (Next.js)               │
│                                                             │
│  ┌──────────────┐         ┌──────────────────────────┐    │
│  │ VideoUploader│────────>│  ProcessingStatus        │    │
│  │  Component   │         │    Component             │    │
│  └──────────────┘         └──────────────────────────┘    │
│         │                           │                       │
└─────────┼───────────────────────────┼───────────────────────┘
          │                           │
          │ POST /api/upload          │ GET /api/status (poll)
          ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js API Routes)           │
│                                                             │
│  /upload ──> /process ──> /status ──> /download            │
│                   │                                         │
└───────────────────┼─────────────────────────────────────────┘
                    │
                    │ Orchestrates Pipeline
                    ▼
┌─────────────────────────────────────────────────────────────┐
│               PROCESSING PIPELINE                           │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐   │
│  │ FFmpeg  │─>│ Demucs  │─>│ Whisper  │─>│ Gemini   │   │
│  │ Extract │  │Separate │  │Transcribe│  │Translate │   │
│  └─────────┘  └─────────┘  └──────────┘  └──────────┘   │
│                                                  │          │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐       │          │
│  │ FFmpeg  │<─│ FFmpeg  │<─│ElevenLabs│<──────┘          │
│  │  Merge  │  │   Mix   │  │ Synthesis│                  │
│  └─────────┘  └─────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│               STORAGE & STATE                               │
│                                                             │
│  ┌─────────────┐        ┌────────────────┐                │
│  │ Job Status  │        │ Temp File      │                │
│  │ (In-Memory) │        │ Storage        │                │
│  └─────────────┘        └────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend Layer

#### 1. VideoUploader Component
```typescript
Responsibilities:
- Drag-and-drop file upload
- File validation (type, size)
- Upload progress tracking
- Trigger processing

Dependencies:
- react-dropzone
- axios
```

#### 2. ProcessingStatus Component
```typescript
Responsibilities:
- Poll job status every 2 seconds
- Display current stage and progress
- Show step-by-step completion
- Provide download link on completion

State Management:
- Local React state
- Polling via useEffect
```

#### 3. Main Page (app/page.tsx)
```typescript
Responsibilities:
- Layout and routing
- State coordination between components
- Hero section and feature display

Design:
- Gradient animated background
- Glassmorphism effects
- Responsive grid layout
```

### API Layer

#### 1. POST /api/upload
```typescript
Input: FormData with video file
Process:
  1. Validate file type and size
  2. Generate unique job ID
  3. Save file to temp directory
  4. Return job ID
Output: { jobId, filename, size }
```

#### 2. POST /api/process
```typescript
Input: { jobId }
Process:
  1. Initialize job status
  2. Start async processing pipeline
  3. Return immediately
Output: { success, jobId }
```

#### 3. GET /api/status?jobId={id}
```typescript
Input: jobId query parameter
Process:
  1. Look up job status in memory
  2. Return current state
Output: {
  status: 'processing' | 'complete' | 'error',
  stage: string,
  progress: number,
  message: string,
  downloadUrl?: string
}
```

#### 4. GET /api/download?jobId={id}&filename={name}
```typescript
Input: jobId and filename
Process:
  1. Validate file exists
  2. Stream file to client
Output: Video file stream
```

### Processing Layer

#### Core Libraries

**lib/ffmpeg.ts**
```typescript
Functions:
- extractAudio(): Extract WAV from video
- mixAudio(): Mix vocals + background
- mergeAudioToVideo(): Combine audio to video
- getVideoDuration(): Get video length
```

**lib/python-runner.ts**
```typescript
Functions:
- runPythonScript(): Execute Python scripts
- runDemucs(): Run audio separation

Features:
- Virtual environment detection
- Real-time output streaming
- Error handling
```

**lib/whisper.ts**
```typescript
Functions:
- transcribeAudio(): Transcribe with Whisper API
- transcribeAndSave(): Transcribe + save JSON

Output Format:
{
  text: string,
  segments: [{ id, start, end, text }],
  language: string,
  duration: number
}
```

**lib/gemini.ts**
```typescript
Functions:
- translateToSinglish(): Single text translation
- translateSegments(): Batch segment translation
- translateWithContext(): Context-aware translation

Features:
- Authentic Singlish particles (lah, leh, lor)
- Maintains tone and emotion
- Batch processing for efficiency
```

**lib/elevenlabs.ts**
```typescript
Functions:
- textToSpeech(): Single TTS request
- generateSegmentAudio(): Batch TTS generation
- getAvailableVoices(): List available voices

Settings:
- stability: 0.5
- similarityBoost: 0.75
- style: 0.0
- speakerBoost: true
```

**lib/utils.ts**
```typescript
Utilities:
- ensureDir(): Create directories
- generateUniqueFilename(): Timestamp-based names
- cleanupFiles(): Delete temp files
- getJobPaths(): Get all paths for a job
```

**lib/job-status.ts**
```typescript
State Management:
- In-memory Map for job status
- Get/Set/Delete operations
- Shared across API routes

Note: Replace with Redis in production
```

### Python Backend

**python_backend/audio_separator.py**
```python
Main Function: separate_audio(input, output)

Process:
1. Load Demucs model (htdemucs)
2. Load and preprocess audio
3. Run separation inference
4. Save vocals and background

Output:
- vocals.wav
- background.wav
- stems/ (drums, bass, other)
```

## Data Flow

### 1. Upload Flow
```
User selects file
    │
    ▼
VideoUploader validates
    │
    ▼
FormData POSTed to /api/upload
    │
    ▼
File saved to temp/{jobId}/original.{ext}
    │
    ▼
Job ID returned to frontend
```

### 2. Processing Flow
```
Frontend POSTs to /api/process
    │
    ▼
Job status initialized
    │
    ▼
processVideo() called asynchronously
    │
    ├─> Extract Audio (FFmpeg)
    ├─> Separate Audio (Demucs/Python)
    ├─> Transcribe (Whisper API)
    ├─> Translate (Gemini API)
    ├─> Synthesize (ElevenLabs API)
    ├─> Concatenate (FFmpeg)
    ├─> Mix (FFmpeg)
    └─> Merge (FFmpeg)
        │
        ▼
    Job status = 'complete'
```

### 3. Status Polling Flow
```
Frontend polls /api/status every 2s
    │
    ▼
API looks up job ID in memory
    │
    ▼
Returns current status
    │
    ▼
Frontend updates UI
    │
    └─> Loop until complete/error
```

### 4. Download Flow
```
User clicks download button
    │
    ▼
Browser navigates to /api/download?jobId={id}&filename={name}
    │
    ▼
API streams file
    │
    ▼
Browser downloads video
```

## File System Structure

```
temp/
└── {jobId}/
    ├── original.mp4              # Uploaded video
    ├── extracted_audio.wav       # Extracted audio
    ├── separated/                # Demucs output
    │   ├── vocals.wav           # Isolated vocals
    │   ├── background.wav       # Background mix
    │   └── stems/               # Individual stems
    │       ├── drums.wav
    │       ├── bass.wav
    │       └── other.wav
    ├── transcription.json        # Whisper output
    ├── translation.json          # Gemini output
    ├── segments/                 # ElevenLabs output
    │   ├── segment_0000.mp3
    │   ├── segment_0001.mp3
    │   └── ...
    ├── singlish_audio.wav       # Concatenated TTS
    ├── mixed_audio.wav          # Mixed with background
    └── {filename}_singlish.mp4  # Final output
```

## State Management

### Job Status Structure
```typescript
interface JobStatus {
  status: 'processing' | 'complete' | 'error' | 'not_found';
  stage: 
    | 'starting'
    | 'extract_audio'
    | 'separate_audio'
    | 'transcribe'
    | 'translate'
    | 'synthesize'
    | 'concatenate'
    | 'mix'
    | 'merge'
    | 'complete'
    | 'failed';
  progress: number;        // 0-100
  message: string;
  downloadUrl?: string;
  outputFilename?: string;
}
```

### Progress Mapping
```
Stage             → Progress
starting          → 0%
extract_audio     → 10%
separate_audio    → 25%
transcribe        → 45%
translate         → 60%
synthesize        → 70%
concatenate       → 85%
mix               → 90%
merge             → 95%
complete          → 100%
```

## Error Handling

### Validation Errors
- File type validation at upload
- File size limits enforced
- API key presence checked at runtime

### Processing Errors
- FFmpeg errors caught and reported
- Python script errors captured
- API errors with user-friendly messages
- Graceful degradation where possible

### User Feedback
- Inline error messages in UI
- Retry button on failures
- Detailed error logs in console

## Performance Optimization

### Current Optimizations
- Async processing (non-blocking)
- Video stream copying (no re-encoding)
- Batch API requests where possible
- Rate limiting on ElevenLabs (500ms delay)

### Future Optimizations
- WebSocket for real-time updates
- Job queue for parallel processing
- Chunked file uploads
- CDN for static assets
- Caching for repeated translations

## Scalability Considerations

### Current Limitations
- In-memory state (single server)
- Synchronous processing per endpoint
- Local file storage
- No job prioritization

### Scaling Strategy
```
Current:
Single Next.js Server
    ↓
Step 1: Add Job Queue
Next.js + Redis + Bull Queue
    ↓
Step 2: Separate Workers
Next.js + Redis + Worker Pool
    ↓
Step 3: Cloud Storage
+ S3/GCS for video files
    ↓
Step 4: Database
+ PostgreSQL for persistence
    ↓
Step 5: Kubernetes
Horizontal scaling with K8s
```

## Security Architecture

### Current Security
- Environment variable for API keys
- File type validation
- File size limits
- Path traversal prevention

### Production Security Needed
- User authentication (JWT)
- Rate limiting per user
- Input sanitization
- CORS configuration
- CSP headers
- API key rotation
- Audit logging

## Monitoring & Observability

### Recommended Metrics
- Job completion rate
- Average processing time per video length
- API error rates
- Storage usage
- API cost per job
- User engagement metrics

### Logging Points
- Job start/end times
- Each pipeline stage completion
- API request/response times
- Error occurrences
- User actions

---

This architecture is designed for easy extension and scaling as your needs grow!

