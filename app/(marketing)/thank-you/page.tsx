import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ArrowRight, Sparkles, BookOpen, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Demo Request Received — SocialAI",
  description: "Your demo request has been received. Our team will be in touch within 24 hours.",
  robots: { index: false, follow: true },
};

export default function ThankYouPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground mb-4">
          You&apos;re All Set!
        </h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
          Your demo request has been received. A product specialist will reach out to{" "}
          <span className="font-semibold text-foreground">schedule your personalized walkthrough</span>{" "}
          within 24 hours.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-12 text-left">
          {[
            { icon: Sparkles, title: "Personalized Demo", desc: "Tailored to your use case and business needs" },
            { icon: BookOpen, title: "Product Resources", desc: "Explore our docs and help center in the meantime" },
            { icon: MessageSquare, title: "Q&A Session", desc: "Get answers from product specialists" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-xl border border-border bg-card p-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/pricing">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-[40px] text-base font-bold">
              View Pricing Plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="h-12 px-8 rounded-[40px] text-base font-bold border-border">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
