import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Images, Video, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function GalleryQuickStart() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg">Generate Videos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <p className="text-muted-foreground text-sm">
            Create stunning AI videos using Runway or Luma. Your completed videos will appear here automatically.
          </p>
          <Link href="/videos">
            <Button className="w-full group">
              <Plus className="h-4 w-4 mr-2" />
              Create Video
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
              <Images className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-lg">Generate Images</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <p className="text-muted-foreground text-sm">
            Generate beautiful AI images with various styles. Your creations will be displayed in the Images tab.
          </p>
          <Link href="/image">
            <Button variant="outline" className="w-full group">
            <Plus className="h-4 w-4 mr-2" />
            Create Images
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
