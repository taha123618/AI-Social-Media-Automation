import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function TalkToSalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${inter.variable}`}
      style={{ fontFamily: "var(--font-inter), 'Inter Placeholder', sans-serif" }}
    >
      <style>{`
        .talk-to-sales {
          --font-sans: var(--font-inter), 'Inter Placeholder', sans-serif;
          --background: #ffffff;
          --foreground: #1e2022;
          --card: #ffffff;
          --card-foreground: #1e2022;
          --primary: #2e42ff;
          --primary-foreground: #ffffff;
          --secondary: #f8f8ff;
          --secondary-foreground: #19154e;
          --muted: #f8f8ff;
          --muted-foreground: #51565b;
          --accent: #f8f8ff;
          --accent-foreground: #19154e;
          --border: rgba(81, 86, 91, 0.15);
          --input: rgba(81, 86, 91, 0.30);
          --ring: rgba(46, 66, 255, 0.30);
          --radius: 0.5rem;
          --destructive: #dc2626;
        }
        .dark .talk-to-sales {
          --background: #000000;
          --foreground: #ffffff;
          --card: rgba(255, 255, 255, 0.05);
          --card-foreground: #ffffff;
          --primary: #2e42ff;
          --primary-foreground: #ffffff;
          --secondary: rgba(255, 255, 255, 0.05);
          --secondary-foreground: #f8f8ff;
          --muted: rgba(255, 255, 255, 0.05);
          --muted-foreground: #9ca3af;
          --accent: rgba(255, 255, 255, 0.06);
          --accent-foreground: #f8f8ff;
          --border: rgba(255, 255, 255, 0.10);
          --input: rgba(255, 255, 255, 0.20);
          --ring: rgba(46, 66, 255, 0.50);
          --destructive: #ef4444;
        }
      `}</style>
      <div className="talk-to-sales">{children}</div>
    </div>
  );
}
