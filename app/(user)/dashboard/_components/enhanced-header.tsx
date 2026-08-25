'use client';

import { useSession } from '@/lib/auth-client';
import { useState, useEffect } from 'react';
import { Heart, Zap, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { Badge } from '@/components/ui/badge';

export function EnhancedDashboardHeader() {
   const { data: session } = useSession();
   const [currentDate, setCurrentDate] = useState('');

   useEffect(() => {
      setCurrentDate(new Date().toLocaleDateString('en-US', {
         weekday: 'short',
         year: 'numeric',
         month: 'short',
         day: 'numeric'
      }).toUpperCase());
   }, []);

   const { businessId } = useCurrentBusiness();
   const { data: dashboardData } = useDashboardStats(businessId);

   const brandHealth = {
      score: dashboardData?.brandHealth?.score || 0,
      engagement: dashboardData?.brandHealth?.engagement || 0,
      consistency: dashboardData?.brandHealth?.consistency || 0,
      reach: dashboardData?.brandHealth?.reach || 0
   };

   const healthMetrics = [
      { label: 'ENGAGEMENT', value: brandHealth.engagement, icon: <Zap className="h-3.5 w-3.5" /> },
      { label: 'CONSISTENCY', value: brandHealth.consistency, icon: <Shield className="h-3.5 w-3.5" /> },
      { label: 'REACH', value: brandHealth.reach, icon: <TrendingUp className="h-3.5 w-3.5" /> }
   ];

   const stats = [
      {
         label: 'CONTENT DRAFTS',
         value: dashboardData?.metrics?.find((m: { label: string; value: string }) => m.label === 'Content Drafts')?.value || '0',
         change: 'READY',
         icon: <Sparkles className="h-4 w-4 text-primary" />,
      },
      {
         label: 'ACTIVE AGENTS',
         value: String(dashboardData?.workflowStats?.active || 0),
         change: 'RUNNING',
         icon: <TrendingUp className="h-4 w-4 text-primary" />,
      },
      {
         label: 'AUTOMATION SUCCESS',
         value: dashboardData?.workflowStats?.successRate || '100%',
         change: 'TELEMETRY',
         icon: <Zap className="h-4 w-4 text-primary" />,
      },
      {
         label: 'ENGAGEMENT RATE',
         value: dashboardData?.metrics?.find((m: { label: string; value: string }) => m.label === 'Engagement Rate')?.value || '0%',
         change: 'WEEKLY',
         icon: <Heart className="h-4 w-4 text-primary" />,
      }
   ];

   return (
      <div className="space-y-4">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <div className="h-1.5 w-1.5 rounded-none bg-primary" />
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                     SYSTEM ONLINE // {currentDate}
                  </p>
               </div>

               <h2 className="text-xl md:text-2xl font-mono font-black uppercase tracking-tight text-foreground">
                  OPERATOR: <span className="text-primary">{session?.user?.name || 'ADMIN'}</span>
               </h2>

               <p className="mt-1 text-xs font-mono text-muted-foreground">
                  Operational marketing pipelines and autonomous growth loops synchronized.
               </p>
            </div>

            {/* Tactical Telemetry Metric Score */}
            <div className="flex items-center gap-4 bg-card rounded-none p-3.5 border border-border">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-none bg-secondary border border-border flex items-center justify-center text-primary font-mono font-bold text-xs">
                     <Heart className="h-5 w-5" />
                  </div>
                  <div>
                     <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">HEALTH SCORE</div>
                     <div className="text-xl font-mono font-black text-primary">
                        {brandHealth.score}%
                     </div>
                  </div>
               </div>

               <div className="h-8 w-px bg-border" />

               <div className="flex items-center gap-3">
                  {healthMetrics.map((metric, idx) => (
                     <div key={idx} className="text-center font-mono">
                        <div className="flex items-center gap-1 mb-0.5 justify-center">
                           <span className="text-muted-foreground">
                              {metric.icon}
                           </span>
                           <span className="text-[9px] font-bold text-muted-foreground">{metric.label}</span>
                        </div>
                        <div className="text-xs font-black text-foreground">
                           {metric.value}%
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Quick Stats Overview */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat, idx) => (
               <div key={idx} className="bg-card rounded-none p-3.5 border border-border transition-none">
                  <div className="flex items-center justify-between mb-2">
                     <div className="h-7 w-7 rounded-none bg-secondary border border-border flex items-center justify-center">
                        {stat.icon}
                     </div>
                     <Badge variant="lime">
                        {stat.change}
                     </Badge>
                  </div>
                  <div className="text-xl font-mono font-black text-foreground mb-0.5">
                     {stat.value}
                  </div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                     {stat.label}
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}