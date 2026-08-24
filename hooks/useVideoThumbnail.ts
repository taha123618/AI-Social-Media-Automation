'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { VideoThumbnailService } from '@/services/video-thumbnail.service'

interface UseVideoThumbnailOptions {
  videoId: string
  videoUrl: string | undefined
  existingThumbnailUrl: string | undefined
  isVisible: boolean
}

export function useVideoThumbnail({
  videoId,
  videoUrl,
  existingThumbnailUrl,
  isVisible
}: UseVideoThumbnailOptions) {
  const [localThumbUrl, setLocalThumbUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    // Only generate if visible, has a video URL, and no existing thumbnail
    if (!isVisible || !videoUrl || existingThumbnailUrl || isGenerating || localThumbUrl) {
      return
    }

    const generateThumbnail = async () => {
      setIsGenerating(true)
      setError(null)
      try {
        // 1. Generate thumbnail client-side
        const dataUrl = await VideoThumbnailService.generateThumbnailFromVideo(videoUrl)
        setLocalThumbUrl(dataUrl)

        // 2. Persist to database
        await VideoThumbnailService.updateVideoJobWithThumbnail(videoId, dataUrl)

        // 3. Invalidate query to refresh gallery data
        queryClient.invalidateQueries({ queryKey: ['gallery-videos'] })
      } catch (err) {
        console.error('Failed to generate or persist thumbnail:', err)
        setError(err instanceof Error ? err : new Error('Unknown error generating thumbnail'))
      } finally {
        setIsGenerating(false)
      }
    }

    generateThumbnail()
  }, [videoId, videoUrl, existingThumbnailUrl, isVisible, queryClient, isGenerating, localThumbUrl])

  return {
    localThumbUrl,
    isGenerating,
    error
  }
}
