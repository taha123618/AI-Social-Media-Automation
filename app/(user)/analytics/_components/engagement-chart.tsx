'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';

export function EngagementChart({ data }: { data: any[] }) {
  // Map data for chart - in real app would be grouped by date
  // Here we use the latest 7 posts or simulate dates
  const chartData = data.slice(0, 7).reverse().map((p, idx) => ({
    name: `Post ${idx + 1}`,
    impressions: p.metrics.impressions,
    engagement: p.metrics.likes + p.metrics.comments + p.metrics.shares,
    clicks: p.metrics.clicks
  }));

  // Fallback if no data
  if (chartData.length === 0) {
      for(let i=0; i<7; i++) {
          chartData.push({ name: `Day ${i+1}`, impressions: 100 + i*20, engagement: 10 + i*2, clicks: 5 + i });
      }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm"
    >
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Engagement Trends</h3>
        <p className="text-sm text-slate-500">Performance across your last 7 posts</p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{fontSize: 10, fill: '#64748b'}}
                dy={10}
            />
            <YAxis
                axisLine={false}
                tickLine={false}
                tick={{fontSize: 10, fill: '#64748b'}}
            />
            <Tooltip
                contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#1e293b',
                    color: '#fff'
                }}
                itemStyle={{ color: '#fff' }}
            />
            <Area
                type="monotone"
                dataKey="impressions"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorImp)"
            />
            <Area
                type="monotone"
                dataKey="engagement"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
