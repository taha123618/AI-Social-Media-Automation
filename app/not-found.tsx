'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Ghost } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
   return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
         <div className="relative z-10 max-w-md w-full text-center border border-border bg-card p-8 rounded-none shadow-none">
            <div className="w-16 h-16 rounded-none bg-secondary border border-border flex items-center justify-center mx-auto mb-6 text-primary">
               <Ghost className="w-8 h-8" />
            </div>

            <p className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-1">
               TELEMETRY ERROR // 404
            </p>

            <h2 className="text-xl font-mono font-black uppercase text-foreground mb-3 tracking-tight">
               ROUTE NOT FOUND
            </h2>

            <p className="text-xs font-mono text-muted-foreground mb-6 leading-relaxed">
               The requested operational vector does not exist or has been relocated. Return to central command.
            </p>

            <Link href="/dashboard" className="inline-block w-full">
               <Button size="lg" className="w-full">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  RETURN TO CONSOLE
               </Button>
            </Link>
         </div>
      </div>
   );
}
