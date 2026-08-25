import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Images, Video, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function GalleryQuickStart() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card className="rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-all duration-200 shadow-xs relative overflow-hidden group">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Video className="h-5 w-5" />
            </div>
            <CardTitle className="text-sm font-bold text-foreground">Generate AI Videos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-xs leading-relaxed">
            Create high-fidelity AI video reels with brand voice grounding. Rendered assets sync directly to your library.
          </p>
          <Link href="/videos" className="block">
            <Button size="sm" className="w-full text-xs font-semibold rounded-lg group">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              <span>Create Video</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-all duration-200 shadow-xs relative overflow-hidden group">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10 text-accent border border-accent/20">
              <Images className="h-5 w-5" />
            </div>
            <CardTitle className="text-sm font-bold text-foreground">Generate AI Imagery</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-xs leading-relaxed">
            Synthesize social post visuals, thumbnails, and carousel slides tailored to platform aspect ratios.
          </p>
          <Link href="/image" className="block">
            <Button variant="outline" size="sm" className="w-full text-xs font-semibold rounded-lg group">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              <span>Create Images</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
