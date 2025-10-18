# Troubleshooting Guide

## Progress Bar Stuck at "Extracting Audio"

If the UI progress bar is stuck and not updating, follow these steps:

### Step 1: Hard Refresh the Browser

The most common cause is cached JavaScript code.

**Windows/Linux:**
- Chrome/Edge: Press `Ctrl + Shift + R` or `Ctrl + F5`
- Firefox: Press `Ctrl + Shift + R` or `Ctrl + F5`

**Mac:**
- Chrome/Edge/Safari: Press `Cmd + Shift + R`
- Firefox: Press `Cmd + Shift + R`

### Step 2: Check Browser Console

1. Open DevTools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Look for messages starting with `[UI Poll #X]`

**What you should see:**
```
[UI] Starting status polling for job: abc123-...
[UI Poll #1] Fetching status from: /api/status?jobId=abc123...&_t=1234567890
[UI Poll #1] Received: { stage: 'extract_audio', progress: 15, status: 'processing' }
[UI Poll #2] Fetching status from: /api/status?jobId=abc123...&_t=1234567891
[UI Poll #2] Received: { stage: 'transcribe', progress: 35, status: 'processing' }
```

**If you see errors:**
- Check the error message
- Verify the dev server is running
- Check if the API endpoint is accessible

### Step 3: Verify Dev Server is Running

1. Check terminal where you ran `npm run dev`
2. You should see: `✓ Ready on http://localhost:3000`
3. If not running, restart it:
   ```bash
   npm run dev
   ```

### Step 4: Check Job Status Directly

Open this URL in your browser (replace `YOUR_JOB_ID`):
```
http://localhost:3000/api/status?jobId=YOUR_JOB_ID&_t=123456789
```

**Expected response:**
```json
{
  "status": "processing",
  "stage": "transcribe",
  "progress": 35,
  "message": "Transcribing speech with timestamps...",
  "timestamp": 1760817173387
}
```

### Step 5: Check Status File on Disk

The status is also saved to a file. Check:
```
temp/YOUR_JOB_ID/status.json
```

If this file shows `"status": "complete"` but UI shows stuck, then it's definitely a caching issue.

### Step 6: Clear Browser Cache Completely

If hard refresh doesn't work:

**Chrome/Edge:**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Firefox:**
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable Cache"
4. Refresh page

**All Browsers:**
1. Settings → Privacy → Clear browsing data
2. Select "Cached images and files"
3. Clear cache
4. Restart browser

### Step 7: Restart Everything

If still stuck:

1. **Stop dev server:** Press `Ctrl+C` in terminal
2. **Clear Next.js cache:**
   ```bash
   # Windows PowerShell
   Remove-Item -Recurse -Force .next
   
   # Mac/Linux
   rm -rf .next
   ```
3. **Restart dev server:**
   ```bash
   npm run dev
   ```
4. **Hard refresh browser:** `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

## Common Issues & Solutions

### Issue: Console shows "404 Not Found" for `/api/status`

**Solution:** Dev server needs restart
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Issue: Console shows "Job not found"

**Solution:** The job ID is incorrect or expired
- Upload a new video to create a fresh job
- Check if the `temp/` directory exists

### Issue: Progress updates but stays at same percentage

**Solution:** Backend processing might be stuck
1. Check server logs in the terminal
2. Look for error messages
3. Try with a shorter video (< 30 seconds)

### Issue: "Network Error" in console

**Solutions:**
1. Check dev server is running on port 3000
2. Check firewall isn't blocking localhost
3. Try accessing http://localhost:3000 directly

### Issue: Page loads but shows blank/white screen

**Solutions:**
1. Check browser console for JavaScript errors
2. Try different browser
3. Clear cache and restart

## Diagnostic Commands

### Test Status API
```bash
# Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/status?jobId=YOUR_JOB_ID" -Headers @{"Cache-Control"="no-cache"}

# Mac/Linux
curl -H "Cache-Control: no-cache" "http://localhost:3000/api/status?jobId=YOUR_JOB_ID"
```

### Check Running Processes
```bash
# Windows PowerShell
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# Mac/Linux
ps aux | grep node
```

### View Server Logs
Server logs appear in the terminal where you ran `npm run dev`. Look for:
```
[JobStatus] Setting status for abc123: transcribe 35% Transcribing...
[abc123] transcribe: Transcribing speech with timestamps... (35%)
```

## Prevention

To avoid caching issues in the future:

### During Development
1. Keep DevTools open with "Disable cache" checked (Network tab)
2. Use incognito/private browsing mode
3. Hard refresh after code changes

### In Production
Our fixes include:
- ✅ Cache-Control headers on API responses
- ✅ Cache-busting query parameters
- ✅ Timestamps on status updates
- ✅ Faster polling (1.5s)

## Still Having Issues?

If none of the above works:

1. **Check the logs:**
   - Browser console (F12 → Console)
   - Terminal with dev server
   - `temp/YOUR_JOB_ID/status.json`

2. **Verify the fix is applied:**
   - Check `pages/api/status.ts` has cache headers
   - Check `components/ProcessingStatus.tsx` has cache-busting
   - Build succeeded: `npm run build`

3. **Try a fresh upload:**
   - Delete `temp/` folder contents
   - Upload a new short video
   - Watch console logs carefully

4. **System requirements:**
   - Node.js 18+ installed
   - FFmpeg installed and in PATH
   - API keys configured in `.env`

## Quick Fix Summary

**90% of "stuck progress" issues are solved by:**

1. **Hard refresh:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Clear .next cache:** `rm -rf .next` or `Remove-Item -Recurse -Force .next`
3. **Restart dev server:** Stop (`Ctrl+C`) then `npm run dev`
4. **Open DevTools Console:** Check for `[UI Poll]` logs

If you see the logs updating every 1.5 seconds, the system is working correctly!

