'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import ImageGallery from "./image-gallery"
import VideoGallery from "./video-gallery"

export default function GalleryTabs() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState("videos")

  useEffect(() => {
    if (tabParam === 'images' || tabParam === 'videos') {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full max-w-[400px] grid-cols-2 cursor-pointer">
        <TabsTrigger value="videos" className="cursor-pointer">Videos</TabsTrigger>
        <TabsTrigger value="images" className="cursor-pointer">Images</TabsTrigger>
      </TabsList>

      <TabsContent value="videos" className="space-y-6">
        <VideoGallery />
      </TabsContent>

      <TabsContent value="images" className="space-y-6">
        <ImageGallery />
      </TabsContent>
    </Tabs>
  )
}
