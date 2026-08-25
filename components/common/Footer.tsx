import Link from "next/link";
import AppLogo from "./AppLogo";

export default function Footer() {
   return (
      <footer className="py-16 bg-card text-muted-foreground border-t border-border">
         <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
               <div className="col-span-2">
                  <div className="mb-4">
                     <AppLogo />
                  </div>
                  <p className="max-w-xs mb-6 text-muted-foreground text-xs font-mono leading-relaxed">
                     Autonomous AI engine for multi-agent marketing, content scheduling, and CRM revenue attribution.
                  </p>
                  <div className="flex gap-2">
                     <div className="w-8 h-8 rounded-none bg-secondary border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-none cursor-pointer font-mono text-xs">𝕏</div>
                     <div className="w-8 h-8 rounded-none bg-secondary border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-none cursor-pointer font-mono text-xs">in</div>
                     <div className="w-8 h-8 rounded-none bg-secondary border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-none cursor-pointer font-mono text-xs">gh</div>
                  </div>
               </div>

               <div>
                  <h4 className="text-foreground font-mono font-bold uppercase tracking-widest text-xs mb-4">FLEET</h4>
                  <ul className="space-y-2 text-xs font-mono">
                     <li><Link href="/ai-blog-writer" className="hover:text-primary transition-none">AI Blog Writer</Link></li>
                     <li><Link href="/social-media-management-tool" className="hover:text-primary transition-none">Social Engine</Link></li>
                     <li><Link href="/pricing" className="hover:text-primary transition-none">Fleet Tiers</Link></li>
                     <li><Link href="/talk-to-sales" className="hover:text-primary transition-none">Enterprise Ops</Link></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-foreground font-mono font-bold uppercase tracking-widest text-xs mb-4">SYSTEM</h4>
                  <ul className="space-y-2 text-xs font-mono">
                     <li><Link href="/#features" className="hover:text-primary transition-none">Architecture</Link></li>
                     <li><Link href="/#workflow" className="hover:text-primary transition-none">Pipeline</Link></li>
                     <li><Link href="/#tools" className="hover:text-primary transition-none">Tool Fleet</Link></li>
                     <li><Link href="/#faq" className="hover:text-primary transition-none">Directives</Link></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-foreground font-mono font-bold uppercase tracking-widest text-xs mb-4">LEGAL & OPS</h4>
                  <ul className="space-y-2 text-xs font-mono">
                     <li><Link href="/terms" className="hover:text-primary transition-none">Terms of Service</Link></li>
                     <li><Link href="/privacy" className="hover:text-primary transition-none">Privacy Guard</Link></li>
                     <li><Link href="/status" className="hover:text-primary transition-none">System Status</Link></li>
                     <li><Link href="/talk-to-sales" className="hover:text-primary transition-none">Security Portal</Link></li>
                  </ul>
               </div>
            </div>

            <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-muted-foreground">
               <p>© {new Date().getFullYear()} SOCIALAI. AUTONOMOUS MARKETING PLATFORM.</p>
               <p className="text-primary font-bold">ALL SYSTEMS OPERATIONAL // TELEMETRY OK</p>
            </div>
         </div>
      </footer>
   );
}
