import Link from 'next/link';

const AppLogo = () => {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-base shadow-sm group-hover:scale-105 transition-transform">
        S
      </div>
      <span className="text-base font-extrabold tracking-tight text-foreground">
        Social<span className="text-primary">AI</span>
      </span>
    </Link>
  );
};

export default AppLogo;