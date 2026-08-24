'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar, Zap } from 'lucide-react';
import { FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaXTwitter, FaGoogle, FaThreads } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { usePosts } from '@/hooks/api-hooks';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { type IconType } from 'react-icons';

const PLATFORM_CONFIG: Record<string, { color: string; bg: string; label: string; Icon: IconType }> = {
  INSTAGRAM: { color: 'text-pink-600', bg: 'bg-pink-500', label: 'IG', Icon: FaInstagram },
  FACEBOOK: { color: 'text-blue-600', bg: 'bg-blue-500', label: 'FB', Icon: FaFacebook },
  LINKEDIN: { color: 'text-sky-700', bg: 'bg-sky-600', label: 'LI', Icon: FaLinkedin },
  TIKTOK: { color: 'text-slate-800', bg: 'bg-slate-800', label: 'TT', Icon: FaTiktok },
  TWITTER: { color: 'text-slate-700', bg: 'bg-slate-600', label: 'X', Icon: FaXTwitter },
  GOOGLE_MY_BUSINESS: { color: 'text-green-600', bg: 'bg-green-500', label: 'GMB', Icon: FaGoogle },
  THREADS: { color: 'text-slate-800', bg: 'bg-slate-700', label: 'TH', Icon: FaThreads },
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'border-l-blue-500',
  DRAFT: 'border-l-slate-400',
  PUBLISHED: 'border-l-emerald-500',
  POSTED: 'border-l-emerald-500',
  FAILED: 'border-l-red-500',
};

export default function ContentCalendarPage() {
  const router = useRouter();
  const { businessId } = useCurrentBusiness();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const { data: result, isLoading } = usePosts(businessId || '');

  const posts = useMemo(() => {
    if (!result?.success || !result.data?.posts) return [];
    return result.data.posts.map((p: any) => ({
      ...p,
      dateKey: p.scheduledFor
        ? format(new Date(p.scheduledFor), 'yyyy-MM-dd')
        : p.postedAt
          ? format(new Date(p.postedAt), 'yyyy-MM-dd')
          : null,
    })).filter((p: any) => p.dateKey);
  }, [result]);

  const postsByDay = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const post of posts) {
      if (!map[post.dateKey]) map[post.dateKey] = [];
      map[post.dateKey].push(post);
    }
    return map;
  }, [posts]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const selectedDayPosts = selectedDay
    ? postsByDay[format(selectedDay, 'yyyy-MM-dd')] || []
    : [];

  const totalScheduled = posts.filter((p: any) => p.status === 'SCHEDULED').length;
  const totalPublished = posts.filter((p: any) => p.status === 'POSTED' || p.status === 'PUBLISHED').length;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Header */}
      <header className="px-8 py-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              Content Calendar
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Visual overview of your scheduled and published content</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="text-center">
                <div className="text-lg font-black text-blue-600">{totalScheduled}</div>
                <div className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Scheduled</div>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <div className="text-lg font-black text-emerald-600">{totalPublished}</div>
                <div className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Published</div>
              </div>
            </div>
            <Button
              onClick={() => router.push('/posts/create')}
              className="h-11 gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20"
            >
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-black text-slate-900 dark:text-white min-w-[180px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentMonth(new Date())} className="h-9 px-4 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700">
            Today
          </Button>
        </div>
      </header>

      <main className="px-8 py-6 flex gap-6">
        {/* Calendar grid */}
        <div className="flex-1">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="py-2 text-center text-xs font-black uppercase tracking-widest text-slate-400">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((day, idx) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayPosts = postsByDay[key] || [];
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const hasGap = isCurrentMonth && dayPosts.length === 0;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15, delay: idx * 0.005 }}
                  onClick={() => setSelectedDay(isSameDay(day, selectedDay || new Date(0)) ? null : day)}
                  className={cn(
                    'min-h-[100px] rounded-2xl border p-2 cursor-pointer transition-all hover:shadow-md',
                    isCurrentMonth
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800/50',
                    isSelected && 'ring-2 ring-blue-500 ring-offset-2',
                    isToday(day) && 'border-blue-200 dark:border-blue-800',
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn(
                      'text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full',
                      isToday(day)
                        ? 'bg-blue-600 text-white'
                        : isCurrentMonth
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-300 dark:text-slate-600',
                    )}>
                      {format(day, 'd')}
                    </span>
                    {isCurrentMonth && hasGap && (
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/posts/create?date=${key}`); }}
                        className="h-5 w-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-100 hover:text-blue-600 transition-all text-slate-400"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Post dots/chips */}
                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map((post: any, i: number) => {
                      const platform = post.platforms?.[0] || 'OTHER';
                      const cfg = PLATFORM_CONFIG[platform] || { bg: 'bg-slate-400', label: '?', color: 'text-slate-400', Icon: null };
                      const PIcon = cfg.Icon;
                      return (
                        <div
                          key={post.id}
                          className={cn(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded-md border-l-2 truncate leading-tight flex items-center gap-1',
                            'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
                            STATUS_COLORS[post.status] || 'border-l-slate-400',
                          )}
                          title={post.content}
                        >
                          {PIcon ? <PIcon className={cn('h-2.5 w-2.5 shrink-0', cfg.color)} /> : <span className={cn('text-[9px]', cfg.color)}>{cfg.label}</span>}
                          <span className="truncate">{post.content?.slice(0, 18) || 'Draft'}</span>
                        </div>
                      );
                    })}
                    {dayPosts.length > 3 && (
                      <div className="text-[9px] font-black text-slate-400 pl-1">
                        +{dayPosts.length - 3} more
                      </div>
                    )}
                  </div>

                  {/* Gap indicator */}
                  {isCurrentMonth && hasGap && isSameMonth(day, currentMonth) && (
                    <div className="mt-1 text-[9px] text-slate-300 dark:text-slate-600 font-bold text-center opacity-0 group-hover:opacity-100">
                      No content
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-72 shrink-0"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400">{format(selectedDay, 'EEEE')}</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{format(selectedDay, 'MMMM d')}</div>
                </div>
                <Badge variant="outline" className={cn(
                  'font-bold text-xs',
                  selectedDayPosts.length === 0 ? 'border-amber-200 text-amber-600 bg-amber-50' : 'border-emerald-200 text-emerald-600 bg-emerald-50'
                )}>
                  {selectedDayPosts.length === 0 ? 'No content' : `${selectedDayPosts.length} post${selectedDayPosts.length > 1 ? 's' : ''}`}
                </Badge>
              </div>

              {selectedDayPosts.length === 0 ? (
                <div className="text-center py-6">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-500 mb-1">Content gap detected</p>
                  <p className="text-xs text-slate-400 mb-4">This day has no scheduled content</p>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/posts/create?date=${format(selectedDay, 'yyyy-MM-dd')}`)}
                    className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Post
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayPosts.map((post: any) => {
                    const platform = post.platforms?.[0] || 'OTHER';
                    const cfg = PLATFORM_CONFIG[platform] || { bg: 'bg-slate-400', label: '?', color: 'text-slate-500', Icon: null };
                    const PIcon = cfg.Icon;
                    return (
                      <div
                        key={post.id}
                        onClick={() => router.push(`/posts/edit/${post.id}`)}
                        className={cn(
                          'p-3 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:shadow-md transition-all group border-l-4',
                          STATUS_COLORS[post.status] || 'border-l-slate-300',
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          {PIcon ? <PIcon className={cn('h-3.5 w-3.5', cfg.color)} /> : <span className={cn('text-[10px] font-black', cfg.color)}>{cfg.label}</span>}
                          <Badge variant="outline" className="text-[9px] font-black uppercase px-1.5 py-0 h-4">
                            {post.status?.toLowerCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 font-medium leading-relaxed">
                          {post.content || 'No caption'}
                        </p>
                        {post.scheduledFor && (
                          <p className="text-[10px] text-slate-400 mt-1.5 font-bold">
                            {format(new Date(post.scheduledFor), 'h:mm a')}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/posts/create?date=${format(selectedDay, 'yyyy-MM-dd')}`)}
                    className="w-full h-8 rounded-xl font-bold text-xs border-dashed border-slate-300 dark:border-slate-700 gap-1.5 text-slate-500"
                  >
                    <Plus className="h-3 w-3" />
                    Add post to this day
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
