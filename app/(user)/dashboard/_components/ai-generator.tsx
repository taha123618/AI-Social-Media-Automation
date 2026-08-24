import { Button } from '@/components/ui/button'
import { Brain } from 'lucide-react'
import React from 'react'

const AiGenerator = () => {
   return (
      <div className="group relative overflow-hidden bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-500/30 transition-all hover:shadow-blue-500/40">
         <div className="absolute top-0 right-0 h-64 w-64 bg-white/10 blur-[80px] -mr-32 -mt-32 rounded-full transition-all group-hover:scale-110" />
         <div className="absolute bottom-0 left-0 h-40 w-40 bg-purple-600/20 blur-[60px] -ml-20 -mb-20 rounded-full" />

         <div className="relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 border border-white/30 shadow-xl">
               <Brain className="h-9 w-9 text-white" />
            </div>
            <h4 className="text-3xl font-black mb-4 tracking-tighter leading-tight">Elevate with <br />AI Magic</h4>
            <p className="text-blue-100 mb-10 font-bold leading-relaxed opacity-90">
               Transform ideas into a week's worth of engagement in seconds.
            </p>
            <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 font-black rounded-2xl py-8 text-lg tracking-tight shadow-xl transition-all hover:scale-[1.03] active:scale-95">
               Launch AI Generator
            </Button>
         </div>
      </div>
   )
}

export default AiGenerator