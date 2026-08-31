import Link from "next/link";
import AppLogo from "./AppLogo";
import { FaXTwitter, FaLinkedin, FaGithub, FaYoutube } from "react-icons/fa6";

const socialLinks = [
  { icon: FaXTwitter, href: "https://x.com", label: "X / Twitter" },
  { icon: FaLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: FaGithub, href: "https://github.com", label: "GitHub" },
  { icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
];

const footerLinks = {
  Product: [
    { label: "AI Blog Writer", href: "/ai-blog-writer" },
    { label: "AI Carousels", href: "/carousels" },
    { label: "Voice Studio", href: "/voice" },
    { label: "Social Scheduler", href: "/social-media-management-tool" },
    { label: "Pricing & Plans", href: "/pricing" },
    { label: "Talk to Sales", href: "/talk-to-sales" },
  ],
  Platform: [
    { label: "Agent Framework", href: "/#features" },
    { label: "Tool Ecosystem", href: "/#tools" },
    { label: "Documentation", href: "/#faq" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
  Account: [
    { label: "Sign In", href: "/login" },
    { label: "Create Workspace", href: "/register" },
    { label: "Billing & Seats", href: "/settings/billing" },
    { label: "Operator Console", href: "/dashboard" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border/70 text-muted-foreground transition-colors">
      <div className="container mx-auto px-4 max-w-6xl py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <div className="mb-4">
              <AppLogo />
            </div>
            <p className="max-w-xs mb-6 text-sm text-muted-foreground leading-relaxed">
              Enterprise multi-agent social media automation, SEO-optimized blog writing, and predictive analytics engine.
            </p>
            <div className="flex gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-secondary border border-border/70 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-150"
                >
                  <Icon className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="col-span-1">
              <h4 className="text-foreground font-semibold text-xs uppercase tracking-wider mb-4">{group}</h4>
              <ul className="space-y-2.5 text-xs">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-primary transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
