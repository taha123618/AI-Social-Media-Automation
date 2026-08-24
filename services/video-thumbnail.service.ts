export class VideoThumbnailService {
  /**
   * Generate a thumbnail from a video URL using HTML5 video element
   * This is a client-side utility for generating thumbnails when API doesn't provide them
   */
  static async generateThumbnailFromVideo(videoUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      video.crossOrigin = 'anonymous';
      video.muted = true;

      video.addEventListener('loadeddata', () => {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Seek to 1 second (or 0.1 if video is shorter)
        const seekTime = Math.min(1, video.duration * 0.1);
        video.currentTime = seekTime;
      });

      video.addEventListener('seeked', () => {
        // Draw the current frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to blob and then to data URL
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(blob);
          } else {
            reject(new Error('Could not generate thumbnail'));
          }
        }, 'image/jpeg', 0.8);
      });

      video.addEventListener('error', (e) => {
        console.error('Video loading error:', e);
        reject(new Error('Video loading error'));
      });

      video.src = videoUrl;
    });
  }

  /**
   * Update video job with generated thumbnail
   */
  static async updateVideoJobWithThumbnail(jobId: string, thumbnailDataUrl: string) {
    try {
      const response = await fetch(`/api/video/${jobId}/thumbnail`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thumbnailUrl: thumbnailDataUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update thumbnail');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating thumbnail:', error);
      throw error;
    }
  }
}
