# FFmpeg Setup for Video Thumbnail Generation

This guide explains how to set up FFmpeg for production video thumbnail generation in the AI Social Media Automation system.

## 🚀 Quick Setup Commands

### Option 1: System Package Manager (Recommended)
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install epel-release && sudo yum install ffmpeg

# Alpine
sudo apk add ffmpeg

# macOS (Homebrew)
brew install ffmpeg
```

### Option 2: Docker Deployment
Add to your Dockerfile:
```dockerfile
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Or use multi-stage build for smaller production image
FROM node:18-alpine AS builder
RUN apk add --no-cache ffmpeg
FROM node:18-alpine AS runner
COPY --from=builder /usr/bin/ffmpeg /usr/bin/ffmpeg
```

### Option 3: NPM Package (Already Added)
The `fluent-ffmpeg` package is already included in package.json for Node.js environments.

## 🔧 Configuration

### Environment Variables
Add these to your `.env` file:
```env
# FFmpeg binary path (if not in system PATH)
FFMPEG_BINARY_PATH=/usr/bin/ffmpeg

# Temporary directory for thumbnail generation
THUMBNAIL_TEMP_DIR=/tmp

# Thumbnail quality settings
THUMBNAIL_QUALITY=2
THUMBNAIL_WIDTH=640
THUMBNAIL_HEIGHT=360
```

## 📁 Implementation Details

### Current FFmpeg Command Used
```bash
ffmpeg -ss 00:00:01 -i "VIDEO_URL" -frames:v 1 -q:v 2 -vf "scale=640:360" -y "output.jpg"
```

### Command Breakdown:
- `-ss 00:00:01` - Seek to 1 second mark
- `-i "VIDEO_URL"` - Input video URL
- `-frames:v 1` - Extract single frame
- `-q:v 2` - JPEG quality (2 = good, 1 = high)
- `-vf "scale=640:360"` - Resize to 640x360
- `-y` - Overwrite output file

## 🏗 Production Considerations

### Security
- FFmpeg runs in sandboxed environment
- Temporary files are cleaned up automatically
- Video URLs are validated before processing

### Performance
- Thumbnails are generated at 640x360 for web optimization
- JPEG compression balances quality and file size
- Base64 encoding for immediate web display

### Error Handling
- Graceful fallbacks when FFmpeg fails
- Detailed logging for debugging
- User-friendly error messages

## 🎯 Next Steps

1. **Install FFmpeg** on your production server using one of the methods above
2. **Deploy** your application with the updated dependencies
3. **Test** thumbnail generation in the video gallery
4. **Monitor** logs for any FFmpeg-related issues

## 📞 Troubleshooting

### Common Issues:
```bash
# Check if FFmpeg is installed
ffmpeg -version

# Test thumbnail generation
curl -X POST http://localhost:3000/api/video/VIDEO_ID/generate-thumbnail-ffmpeg \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Permissions:
Ensure the application has write permissions to the temp directory and the FFmpeg binary is executable.

## 🔄 Alternative: Cloud-Based Processing

For serverless environments, consider using:
- **Cloudinary** - Video transformation API
- **AWS MediaConvert** - AWS video processing
- **Cloudflare Stream** - Video processing at edge

This setup ensures your video thumbnail generation works reliably in production!
