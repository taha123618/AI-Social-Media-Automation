import Link from 'next/link'

const AppLogo = () => {
  return (
     <Link href="/" className="flex items-center gap-2 group justify-center">
        <div className="w-10 h-10 rounded-xl bg-[#2D46FF] flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-200 dark:shadow-none">
           S
        </div>
        <span className="text-xl font-black tracking-tighter text-slate-950 dark:text-white">SocialAI</span>
     </Link>
  )
}

export default AppLogo