'use client';

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function EngagementChart({ data }: { data: any[] }) {
  const chartData = data.slice(0, 7).reverse().map((p, idx) => ({
    name: `Post ${idx + 1}`,
    impressions: p.metrics.impressions,
    engagement: p.metrics.likes + p.metrics.comments + p.metrics.shares,
    clicks: p.metrics.clicks
  }));

  if (chartData.length === 0) {
    for (let i = 0; i < 7; i++) {
      chartData.push({ name: `Day ${i + 1}`, impressions: 120 + i * 25, engagement: 15 + i * 4, clicks: 8 + i * 2 });
    }
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/50">
        <div>
          <h3 className="text-base font-bold text-foreground">Engagement & Impression Trajectory</h3>
          <p className="text-xs text-muted-foreground">Historical telemetry across recent dispatch cycles</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Impressions</span>
          </div>
          <div className="flex items-center gap-1.5 text-accent">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span>Engagement</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.6)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '0.5rem',
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area
              type="monotone"
              dataKey="impressions"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorImp)"
            />
            <Area
              type="monotone"
              dataKey="engagement"
              stroke="#6366F1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEng)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
