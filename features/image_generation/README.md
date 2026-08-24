# AI Image Generation System

A comprehensive, queue-based AI-powered image generation system with brand awareness, multiple AI providers, and complete workflow management.

## 🌟 Features

### 🚀 Queue-Based Architecture
- **Asynchronous Processing**: Queue-based job processing with Redis backend
- **High Concurrency**: 10 parallel jobs with configurable rate limiting
- **Error Recovery**: Automatic retries with exponential backoff
- **Status Tracking**: Real-time job status monitoring
- **System Logging**: Comprehensive activity and error logging

### 🎨 Brand-Based Image Generation
- **Brand Management**: Predefined brand presets with color palettes and styles
- **Platform Optimization**: Specific dimensions for Facebook, YouTube, Instagram, and print formats
- **AI Enhancement**: Brand-aware prompt engineering using AIService
- **Smart Model Selection**: Automatic model choice based on brand requirements

### 🤖 Multi-Provider Support
- **OpenAI**: DALL-E 3, DALL-E 2 with accurate text and visuals
- **Stability AI**: Stable Diffusion XL for high-quality artistic generation
- **OpenRouter**: Development-friendly alternative models
- **Google Gemini**: Nano Banna model for quick generation

### 📱 Platform-Specific Generation
- **Facebook**: Post, Ad, Cover with optimized dimensions
- **YouTube**: Thumbnail, Banner, Shorts with video-specific sizing
- **Instagram**: Post, Story with mobile-first design
- **Print**: Brochure, Poster, Banner, Cards with high-resolution output

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│                UI Components                │
├─────────────────────────────────────────────────┤
│  Image Generator        │  Brand Image Generator │
│  Image Gallery         │  Image Jobs List        │
├─────────────────────────────────────────────────┤
│                API Endpoints                 │
├─────────────────────────────────────────────────┤
│  /api/image/generate    │  /api/image/generate-brand │
│  /api/image/jobs       │  /api/image/upload        │
│  /api/image/queue-status│                          │
├─────────────────────────────────────────────────┤
│              Worker System                  │
├─────────────────────────────────────────────────┤
│  ImageGenerationWorker (Standard + Brand)   │
├─────────────────────────────────────────────────┤
│                Core Services                │
├─────────────────────────────────────────────────┤
│  ImageService (Multi-Provider + Brand)      │
│  AIService Integration  │  Image Helpers          │
└─────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Redis server for BullMQ queues
- Environment variables for AI API keys
- Database setup with Prisma

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start the development server
npm run dev

# Start the worker system
npm run workers-simple

# Start the full scheduler
npm run start-scheduler
```

## 📚 API Documentation

### Standard Image Generation

```typescript
POST /api/image/generate
Content-Type: application/json

{
  "businessId": "business_123",  // OR "userId": "user_123"
  "prompt": "A beautiful sunset over mountains",
  "style": "cinematic",
  "aspectRatio": "16:9",
  "quality": "high",
  "model": "dall-e-3",
  "variations": 2
}
```

### Brand-Based Generation

```typescript
POST /api/image/generate-brand
Content-Type: application/json

{
  "businessId": "business_123",  // OR "userId": "user_123"
  "prompt": "Professional business meeting",
  "brand": {
    "name": "TechCorp",
    "colors": ["#3B82F6", "#10B981", "#FFFFFF"],
    "style": "professional"
  },
  "imageType": "facebook-post",
  "primaryColor": "#3B82F6",
  "secondaryColor": "#10B981"
}
```

### Image Upload

```typescript
POST /api/image/upload
Content-Type: multipart/form-data

FormData:
- file: File (image/jpeg, image/png, image/webp, image/gif)
- businessId: string  // OR userId: string
```

### Job Management

```typescript
GET /api/image/jobs?businessId=business_123  // OR ?userId=user_123
DELETE /api/image/jobs
Content-Type: application/json

{
  "jobId": "job_123",
  "businessId": "business_123"  // OR "userId": "user_123"
}
```

## 🎯 Usage Examples

### React Components

```typescript
import ImageGenerator from '@/features/image/components/image-generator';
import BrandImageGenerator from '@/features/image/components/brand-image-generator';
import ImageGallery from '@/features/image/components/image-gallery';

// Standard generation
<ImageGenerator businessId="business_123" onImageGenerated={(result) => console.log(result)} />
// OR legacy userId approach
<ImageGenerator userId="user_123" onImageGenerated={(result) => console.log(result)} />

// Brand-based generation
<BrandImageGenerator businessId="business_123" onImageGenerated={(result) => console.log(result)} />
// OR legacy userId approach
<BrandImageGenerator userId="user_123" onImageGenerated={(result) => console.log(result)} />

// Gallery view (uses active workspace automatically)
<ImageGallery refreshTrigger={Date.now()} />
// OR manual ID specification
<ImageGallery businessId="business_123" refreshTrigger={Date.now()} />
<ImageGallery userId="user_123" refreshTrigger={Date.now()} />
```

### Direct Service Calls

```typescript
import { ImageService } from '@/features/image/services/image.service';

// Standard generation
const result = await ImageService.generateImage({
  businessId: 'business_123',  // OR userId: 'user_123'
  prompt: 'A beautiful sunset',
  style: 'cinematic',
  aspectRatio: '16:9',
  quality: 'high'
});

// Brand-based generation
const brandResult = await ImageService.generateBrandImage({
  businessId: 'business_123',  // OR userId: 'user_123'
  prompt: 'Professional business meeting',
  brand: {
    name: 'TechCorp',
    colors: ['#3B82F6', '#10B981'],
    style: 'professional'
  },
  imageType: 'facebook-post'
});

// Get available image types
const types = ImageService.getAvailableImageTypes();
```

## 🔧 Configuration

### Environment Variables

```bash
# AI Provider API Keys
OPENAI_API_KEY=your_openai_api_key
STABILITY_API_KEY=your_stability_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# Database
DATABASE_URL=your_database_url

# Environment
NODE_ENV=development  # or production
```

### Brand Configuration

```typescript
const customBrand = {
  name: 'My Brand',
  colors: ['#FF6B6B', '#4ECDC4', '#F3E5F1'],
  style: 'modern',
  fonts: ['Inter', 'Roboto']
};
```

## 📊 Monitoring

### Queue Status

```typescript
GET /api/image/queue-status

Response:
{
  "stats": {
    "imageGeneration": {
      "waiting": 5,
      "active": 2,
      "completed": 150,
      "failed": 3
    }
  },
  "uptime": 1234.56,
  "memory": {
    "used": "256MB",
    "total": "512MB"
  }
}
```

### Health Checks

```bash
# Check worker status
curl http://localhost:3000/api/image/queue-status

# Test image generation
curl -X POST http://localhost:3000/api/image/generate \
  -H "Content-Type: application/json" \
  -d '{"businessId":"test","prompt":"test image"}'  # OR use "userId"
```

## 🛠 Development

### Adding New Image Types

```typescript
// In image-helpers.ts
export const CUSTOM_IMAGE_TYPES = {
  'linkedin-post': {
    name: 'LinkedIn Post',
    aspectRatio: '1:1',
    dimensions: { width: 1200, height: 1200 },
    description: 'Optimized for LinkedIn feed'
  }
};

// In ImageService
private static imageTypes = {
  ...existingTypes,
  ...CUSTOM_IMAGE_TYPES
};
```

### Adding New AI Providers

```typescript
// In image.service.ts
private static generateWithNewProvider(request: ImageGenerationRequest) {
  // Implementation for new AI provider
  const response = await fetch('https://new-provider-api.com/generate', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${this.newProviderConfig.apiKey}` },
    body: JSON.stringify({ prompt: request.prompt, style: request.style })
  });

  return this.parseResponse(response);
}
```

## 🔒 Security Considerations

### Input Validation
- All inputs validated using Zod schemas
- File type and size restrictions enforced
- SQL injection prevention through parameterized queries
- Rate limiting recommendations for production

### API Key Management
- Store API keys in environment variables only
- Use different keys for development and production
- Implement key rotation for production deployments
- Monitor API usage and costs

## 📈 Performance Optimization

### Caching Strategy
- Redis-based caching for generated images
- CDN integration for production deployments
- Lazy loading for gallery components
- Image optimization and compression

### Queue Management
- BullMQ for reliable job processing
- Worker concurrency limits based on API rate limits
- Automatic retry logic with exponential backoff
- Dead letter queue for failed jobs

## 🚨 Troubleshooting

### Common Issues

#### Generation Failures
```bash
# Check API keys
echo $OPENAI_API_KEY

# Check Redis connection
redis-cli ping

# Check worker logs
npm run workers-simple
```

#### Performance Issues
```bash
# Monitor memory usage
node --max-old-space-size=8192 scripts/workers-simple.js

# Profile generation times
curl -w "@%{time_total}s" -X POST http://localhost:3000/api/image/generate
```

#### Database Issues
```bash
# Check database connection
npx prisma db pull

# Reset database
npx prisma migrate reset
```

## 📝 License

MIT License - feel free to use this system in your projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the API documentation

---

**Built with ❤️ using modern web technologies and AI integration**
