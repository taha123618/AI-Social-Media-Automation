import Link from "next/link";
import AppLogo from "./AppLogo";

export default function Footer() {
  return (
    <footer className="py-16 bg-card border-t border-border/70 text-muted-foreground transition-colors">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="mb-4">
              <AppLogo />
            </div>
            <p className="max-w-xs mb-6 text-sm text-muted-foreground leading-relaxed">
              Enterprise multi-agent social media automation, SEO-optimized blog writing, and predictive analytics engine.
            </p>
            <div className="flex gap-3">
              {["X", "IN", "GH", "YT"].map((item) => (
                <div
                  key={item}
                  className="w-8 h-8 rounded-lg bg-secondary border border-border/70 flex items-center justify-center text-xs font-mono font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-foreground font-semibold text-xs uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/ai-blog-writer" className="hover:text-primary transition-colors">AI Blog Writer</Link></li>
              <li><Link href="/social-media-management-tool" className="hover:text-primary transition-colors">Social Scheduler</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing & Plans</Link></li>
              <li><Link href="/talk-to-sales" className="hover:text-primary transition-colors">Talk to Sales</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-semibold text-xs uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/#features" className="hover:text-primary transition-colors">Agent Framework</Link></li>
              <li><Link href="/#tools" className="hover:text-primary transition-colors">Tool Ecosystem</Link></li>
              <li><Link href="/#faq" className="hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-semibold text-xs uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">Create Workspace</Link></li>
              <li><Link href="/settings/billing" className="hover:text-primary transition-colors">Billing & Seats</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Operator Console</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} SocialAI Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/security" className="hover:text-primary transition-colors">Security Guardrails</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
