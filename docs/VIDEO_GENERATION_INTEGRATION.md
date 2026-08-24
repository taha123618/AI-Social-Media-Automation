# Video Generation with Runway ML Integration

This document describes the complete video generation system integrated with Runway ML and your RAG pipeline.

## Features Implemented

### 1. Core Video Services
- **Runway ML Integration**: Generate videos using Runway Gen-3 Turbo
- **Luma Integration**: Alternative video generation provider
- **Job Management**: Track generation status, cancel jobs, view history
- **Brand Filters**: Apply watermarks, color grading, platform optimization

### 2. RAG-Powered Smart Generation
- **Brand-Aware Prompts**: Automatically creates prompts using your business context
- **Tone Mapping**: Maps brand tone to appropriate video styles
- **Platform Optimization**: Auto-selects optimal aspect ratios
- **Context Integration**: Uses mission, vision, values from knowledge base

### 3. Frontend Components
- **Video Generator**: Manual prompt-based generation
- **RAG Dashboard**: Smart brand-aware generation
- **Job History**: Track all video generation jobs
- **Real-time Status**: Automatic polling for job updates

## API Endpoints

### Video Generation
```
POST /api/video/generate
{
  "visualPrompt": "Professional business owner smiling at camera...",
  "style": "cinematic",
  "duration": 15,
  "aspectRatio": "16:9",
  "quality": "hd"
}
```

### RAG-Powered Generation
```
POST /api/video/rag-generate
{
  "contentType": "product demo",
  "targetAudience": "small business owners",
  "tone": "PROFESSIONAL",
  "platform": "instagram",
  "duration": 15,
  "quality": "hd"
}
```

### Job Management
```
GET /api/video/jobs           # List all jobs
GET /api/video/status/{jobId} # Check job status
POST /api/video/cancel/{jobId} # Cancel job
POST /api/video/brand-filters # Apply brand consistency
```

## Usage Examples

### Basic Video Generation
```typescript
const result = await VideoService.generateWithRunway({
  businessId: "business-abc",
  visualPrompt: "Professional business owner smiling at camera, modern office background, friendly professional tone",
  style: "cinematic",
  duration: 15,
  aspectRatio: "16:9",
  quality: "hd"
});
```

### Poll for Status Updates
```typescript
// Poll status every 30s
const status = await VideoService.checkStatus(result.jobId);

// Or use automatic polling
const finalStatus = await RagVideoService.pollJobStatus(result.jobId);
```

### Apply Brand Filters
```typescript
const finalVideo = await VideoService.applyBrandFilters("business-abc", status.videoUrl!, {
  addWatermark: true,
  applyColorGrade: true,
  resizeForPlatform: "instagram"
});
```

### RAG Integration (Brand-Aware Generation)
```typescript
// Perfect for social media automation Phase 2!
const brandContext = await KnowledgeService.getBrandContext(businessId);
const prompt = `Create a ${contentType} video for ${profile.targetAudience}. ${brandContext}`;

const videoResult = await VideoService.generateWithRunway({
  businessId,
  visualPrompt: prompt,
  style: profile.tone === "professional" ? "cinematic" : "friendly"
});

// OR use the smart RAG service:
const ragResult = await RagVideoService.generateWithRag({
  businessId: "business-abc",
  contentType: "product demo",
  targetAudience: "tech entrepreneurs",
  tone: "PROFESSIONAL",
  platform: "instagram"
});
```

## Frontend Integration

### Video Dashboard Page
Accessible at `/videos` - Provides:
- Smart generator with brand context
- Manual generation mode
- Job history with real-time updates
- Brand filter application

### Component Usage
```tsx
import { RagVideoDashboard } from "@/components/video/rag-video-dashboard";

export default function VideosPage() {
  return <RagVideoDashboard />;
}
```

## Environment Variables Required

```env
# Video Generation APIs
RUNWAY_API_KEY=your_runway_api_key_here
LUMA_API_KEY=your_luma_api_key_here
```

## Key Benefits

1. **Brand Consistency**: Videos automatically reflect your brand voice and values
2. **Smart Optimization**: Platform-specific formatting and aspect ratios
3. **RAG Integration**: Leverages your business knowledge for better prompts
4. **Real-time Monitoring**: Automatic status updates every 30 seconds
5. **Flexible Workflow**: Both manual and smart generation modes
6. **Professional Output**: High-quality videos with brand overlays

## Architecture

```
Frontend Components
├── RagVideoDashboard (Main UI)
├── VideoGenerator (Manual mode)
└── VideoJobsList (History tracking)

Services
├── VideoService (Core generation)
├── RagVideoService (RAG integration)
└── KnowledgeService (Brand context)

API Routes
├── /api/video/generate
├── /api/video/rag-generate
├── /api/video/status/[jobId]
├── /api/video/jobs
├── /api/video/cancel/[jobId]
└── /api/video/brand-filters
```

The system is now fully integrated and ready for production use!