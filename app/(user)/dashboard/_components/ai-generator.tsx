import { Button } from '@/components/ui/button'
import { Brain } from 'lucide-react'
import React from 'react'

const AiGenerator = () => {
   return (
      <div className="relative overflow-hidden bg-card rounded-none p-5 text-foreground border border-border transition-none">
         <div className="relative z-10">
            <div className="h-10 w-10 rounded-none bg-secondary border border-border flex items-center justify-center mb-4 text-primary">
               <Brain className="h-5 w-5" />
            </div>
            <h4 className="text-base font-mono font-bold uppercase tracking-wider mb-2 text-foreground">
               AUTONOMOUS CONTENT GENERATOR
            </h4>
            <p className="text-xs font-mono text-muted-foreground mb-4 leading-relaxed">
               Deploy multi-agent marketing workflows to generate verified, high-conversion multi-platform campaigns.
            </p>
            <Button size="lg" className="w-full">
               DISPATCH AI AGENT PIPELINE
            </Button>
         </div>
      </div>
   )
}

export default AiGenerator