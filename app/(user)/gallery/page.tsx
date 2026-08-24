import { Suspense } from "react";
import GalleryTabs from "./_components/gallery-tabs";
import GalleryQuickStart from "./_components/gallery-quick-start";

export default function GalleryPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
        <p className="text-muted-foreground">
          Browse your generated images and videos in one place
        </p>
      </div>

      <GalleryQuickStart />

      <Suspense fallback={<div>Loading gallery...</div>}>
        <GalleryTabs />
      </Suspense>
    </div>
  );
}
