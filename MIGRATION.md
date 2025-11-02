# Migration to Free APIs - Cost Savings Guide

## Overview

This application has been migrated from expensive Google Cloud Vertex AI services to free Google Gemini APIs to eliminate costs.

## What Changed

### ✅ Before (Expensive - Vertex AI)
- **Video Generation (Veo)**: ~$0.08-0.24 per second of video
- **Image Generation (Imagen 3)**: ~$0.04 per image  
- **Music Generation (Lyria)**: ~$0.10-0.30 per generation
- **Text Generation (Gemini via Vertex AI)**: Billed per token
- **Required**: Google Cloud Project with billing enabled
- **Monthly Cost**: Can easily exceed $200+ with moderate usage

### ✅ After (Free - Gemini API)
- **Video Generation**: DISABLED (too expensive)
- **Image Generation**: DISABLED (too expensive)
- **Music Generation**: DISABLED (too expensive)
- **Text Generation (Gemini 1.5 Flash)**: FREE tier with generous limits
- **Required**: Only a free Gemini API key from Google AI Studio
- **Monthly Cost**: $0 (within free tier limits)

## Setup Instructions

### 1. Get a Free Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Click "Get API key" 
4. Create a new API key
5. Copy the key

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   GEN_MODEL=gemini-1.5-flash
   ```

3. Remove old Vertex AI environment variables if present:
   - ~~`PROJECT_ID`~~ (not needed)
   - ~~`VIDEO_MODEL`~~ (not needed)
   - ~~`IMAGE_MODEL`~~ (not needed)
   - ~~`MUSIC_MODEL`~~ (not needed)

### 3. Install Dependencies

```bash
npm install
```

### 4. Build and Run

```bash
npm run build
npm run dev
```

## Free Tier Limits

Gemini 1.5 Flash free tier includes:
- **15 requests per minute (RPM)**
- **1 million tokens per minute (TPM)**
- **1,500 requests per day (RPD)**

These limits are generous for most use cases. If you exceed them, the API will return rate limit errors.

## Features Still Working

✅ **Dream Analysis**: Full dream interpretation and analysis using Gemini 1.5 Flash
✅ **Dream Classification**: Automatic tagging, sentiment analysis, and emotion detection
✅ **Dream Descriptions**: Rich, descriptive text generation for dream worlds
✅ **Text-based Features**: All text generation continues to work perfectly

## Features Disabled (to Save Costs)

❌ **Video Generation**: Would cost $0.08-0.24 per second
❌ **Background Images**: Would cost $0.04 per image
❌ **Floating Object Images**: Would cost $0.04 per image  
❌ **Music Generation**: Would cost $0.10-0.30 per track

These features return empty strings instead of generating media. The UI gracefully handles their absence.

## Optional: Re-enable Paid Features

If you need media generation and are willing to pay:

1. Set up Google Cloud Project with billing
2. Enable Vertex AI API
3. Update `src/lib/gemini.ts` to re-enable:
   - `getVideo()`
   - `getImage()`
   - `getMusic()`
4. Add back environment variables:
   ```env
   PROJECT_ID=your-project-id
   VIDEO_MODEL=veo-latest
   IMAGE_MODEL=imagen-3.0-generate-001  
   MUSIC_MODEL=music-generation-model
   ```
5. Restore the original implementation from git history

**Warning**: Enabling these features can quickly result in significant costs!

## Cost Comparison

### Example Usage Scenario (1 night of testing)
**Old Cost (Vertex AI)**:
- 50 dream analyses: ~$0.50
- 10 world generations with video/images/music: ~$50-100
- **Total: $50-100+ per night** ⚠️

**New Cost (Free Gemini API)**:
- 50 dream analyses: $0
- 10 world text descriptions: $0
- **Total: $0** ✅

## Troubleshooting

### "GEMINI_API_KEY environment variable is required"
Make sure you've created `.env.local` and added your API key.

### Rate Limit Errors
You've exceeded the free tier limits. Wait a minute and try again, or reduce request frequency.

### "API key is missing" or "401 Unauthorized"
Your API key is invalid or not set correctly. Get a new key from Google AI Studio.

## Support

For issues or questions, please open an issue on the GitHub repository.
