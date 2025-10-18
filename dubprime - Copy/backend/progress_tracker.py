"""
Progress Tracking for Long-Running Tasks
-----------------------------------------
Simple in-memory progress tracking for transcription jobs.
"""

from datetime import datetime
from threading import Lock

# In-memory progress store
_progress_store = {}
_store_lock = Lock()


def create_progress(job_id, total_steps=1):
    """Create a new progress tracker."""
    with _store_lock:
        _progress_store[job_id] = {
            'current': 0,
            'total': total_steps,
            'percentage': 0,
            'status': 'starting',
            'message': 'Initializing...',
            'created_at': datetime.now().isoformat(),
            'subtitles': []  # Store incremental subtitles
        }


def update_progress(job_id, current, message='', status='processing'):
    """Update progress for a job."""
    with _store_lock:
        if job_id in _progress_store:
            progress = _progress_store[job_id]
            progress['current'] = current
            progress['percentage'] = int((current / progress['total']) * 100) if progress['total'] > 0 else 0
            progress['status'] = status
            if message:
                progress['message'] = message


def get_progress(job_id):
    """Get current progress for a job."""
    with _store_lock:
        return _progress_store.get(job_id, None)


def complete_progress(job_id, message='Complete'):
    """Mark a job as completed."""
    with _store_lock:
        if job_id in _progress_store:
            progress = _progress_store[job_id]
            progress['current'] = progress['total']
            progress['percentage'] = 100
            progress['status'] = 'completed'
            progress['message'] = message


def error_progress(job_id, message='Error occurred'):
    """Mark a job as errored."""
    with _store_lock:
        if job_id in _progress_store:
            progress = _progress_store[job_id]
            progress['status'] = 'error'
            progress['message'] = message


def add_subtitles(job_id, new_subtitles):
    """Add subtitles incrementally to a job."""
    with _store_lock:
        if job_id in _progress_store:
            progress = _progress_store[job_id]
            progress['subtitles'].extend(new_subtitles)


def delete_progress(job_id):
    """Delete progress tracking for a job."""
    with _store_lock:
        if job_id in _progress_store:
            del _progress_store[job_id]
