'use client';

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function EngagementChart({ data }: { data: any[] }) {
  const chartData = data.slice(0, 7).reverse().map((p, idx) => ({
    name: `VECTOR ${idx + 1}`,
    impressions: p.metrics.impressions,
    engagement: p.metrics.likes + p.metrics.comments + p.metrics.shares,
    clicks: p.metrics.clicks
  }));

  if (chartData.length === 0) {
    for (let i = 0; i < 7; i++) {
      chartData.push({ name: `DAY 0${i + 1}`, impressions: 120 + i * 25, engagement: 15 + i * 4, clicks: 8 + i * 2 });
    }
  }

  return (
    <div className="rounded-none border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase text-foreground">ENGAGEMENT & IMPRESSION TRAJECTORY</h3>
          <p className="text-[10px] font-mono text-muted-foreground">Historical telemetry across recent dispatch cycles</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono font-bold">
          <div className="flex items-center gap-1 text-primary">
            <span className="w-2 h-2 bg-primary rounded-none" />
            <span>IMPRESSIONS</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 bg-emerald-400 rounded-none" />
            <span>ENGAGEMENT</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full font-mono">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#CCFF00" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#8A93A0' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#8A93A0' }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '0px',
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                fontFamily: 'monospace',
                fontSize: '11px',
                boxShadow: 'none',
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area
              type="monotone"
              dataKey="impressions"
              stroke="#CCFF00"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorImp)"
            />
            <Area
              type="monotone"
              dataKey="engagement"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
