'use client';

import { motion } from 'framer-motion';
import { Zap, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdRecommendation {
  postId: string;
  title: string;
  engagementRate: string;
  status: string;
  suggestedBudget: string;
  reason: string;
}

interface AdRecommendationsProps {
  recommendations: AdRecommendation[];
}

export function AdRecommendationsCard({ recommendations }: AdRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full bg-purple-600" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">Marketing Booster</p>
        </div>
        <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-2">
          Ad Recommendations
          <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, idx) => (
          <motion.div
            key={rec.postId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-900/50 transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-black text-slate-900 dark:text-white mb-1 line-clamp-1">{rec.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 uppercase tracking-tighter">
                    {rec.engagementRate} Engagement
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 uppercase tracking-tighter">
                    {rec.suggestedBudget}
                  </span>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="rounded-xl hover:bg-purple-50 dark:hover:bg-purple-500/10 text-purple-600">
                <ArrowUpRight className="h-5 w-5" />
              </Button>
            </div>
            
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              {rec.reason}
            </p>

            <Button className="w-full rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all py-6">
              Boost Post Now
            </Button>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
