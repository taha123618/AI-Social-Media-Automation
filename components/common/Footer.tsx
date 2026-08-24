import Link from "next/link";

export default function Footer() {
   return (
      <footer className="py-20 bg-slate-50 dark:bg-[#020617] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-white/5 transition-colors">
         <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
               <div className="col-span-2">
                  <Link href="/" className="flex items-center gap-2 mb-8 group">
                     {/* Logo container has its own bg brand color */}
                     <div className="w-10 h-10 rounded-xl bg-[#2D46FF] flex items-center justify-center font-black text-white text-xl">
                        S
                     </div>
                     <span className="text-xl font-black text-slate-950 dark:text-white tracking-tighter">SocialAI</span>
                  </Link>
                  <p className="max-w-xs mb-8 text-slate-500 dark:text-slate-500 leading-relaxed font-medium">
                     The world's most advanced AI engine for social exponential growth.
                     Join 25k+ creators scaling with automation.
                  </p>
                  <div className="flex gap-4">
                     {/* Social placeholders */}
                     <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-white hover:bg-[#2D46FF] hover:text-white transition-colors cursor-pointer">𝕏</div>
                     <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-white hover:bg-[#2D46FF] hover:text-white transition-colors cursor-pointer">in</div>
                     <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-white hover:bg-[#2D46FF] hover:text-white transition-colors cursor-pointer">gh</div>
                  </div>
               </div>

               <div>
                  <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs mb-8">Product</h4>
                  <ul className="space-y-4 font-bold text-sm">
                     <li><Link href="#" className="hover:text-[#2D46FF] dark:hover:text-white transition-colors">AI Blog Writer</Link></li>
                     <li><Link href="#" className="hover:text-[#2D46FF] dark:hover:text-white transition-colors">Social Engine</Link></li>
                     <li><Link href="#" className="hover:text-[#2D46FF] dark:hover:text-white transition-colors">Ad Copy Gen</Link></li>
                     <li><Link href="#" className="hover:text-[#2D46FF] dark:hover:text-white transition-colors">Pricing</Link></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs mb-8">Company</h4>
                  <ul className="space-y-4 font-bold text-sm">
                     <li><Link href="#" className="hover:text-[#2D46FF] dark:hover:text-white transition-colors">About Us</Link></li>
                     <li><Link href="#" className="hover:text-[#2D46FF] dark:hover:text-white transition-colors">Careers</Link></li>
                     <li><Link href="#" className="hover:text-[#2D46FF] dark:hover:text-white transition-colors">Privacy Policy</Link></li>
                     <li><Link href="#" className="hover:text-[#2D46FF] dark:hover:text-white transition-colors">Terms</Link></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs mb-8">Support</h4>
                  <ul className="space-y-4 font-bold text-sm">
                     <li><Link href="#" className="hover:text-[#2D46FF] dark:hover:text-white transition-colors">Help Center</Link></li>
                     <li><Link href="#" className="hover:text-[#2D46FF] dark:hover:text-white transition-colors">API Docs</Link></li>
                     <li><Link href="#" className="hover:text-[#2D46FF] dark:hover:text-white transition-colors">Contact Sales</Link></li>
                     <li><Link href="#" className="hover:text-[#2D46FF] dark:hover:text-white transition-colors">Status</Link></li>
                  </ul>
               </div>
            </div>

            <div className="pt-12 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
               <p className="text-xs font-bold text-slate-500">
                  © 2026 SocialAI Technologies Inc. All rights reserved.
               </p>
               <div className="flex gap-8">
                  <Link href="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors">Instagram</Link>
                  <Link href="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors">Discord</Link>
                  <Link href="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors">YouTube</Link>
               </div>
            </div>
         </div>
      </footer>
   );
}
