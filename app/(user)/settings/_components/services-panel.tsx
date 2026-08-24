"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Info, Eye, EyeOff, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface ServicesPanelProps {
  businessId: string | null;
}

export function ServicesPanel({ businessId }: ServicesPanelProps) {
  const queryClient = useQueryClient();
  const [showXSecret, setShowXSecret] = useState(false);

  const [config, setConfig] = useState({
    apiKey: '',
    apiSecret: '',
    apiTier: 'free',
    isActive: true
  });

  // React Query way to fetch config
  const { data: services, isLoading: isFetching } = useQuery<any[]>({
    queryKey: ['services', businessId],
    queryFn: async (): Promise<any[]> => {
      if (!businessId) return [];
      const { data } = await axios.get<any[]>('/api/settings/services', {
        headers: { 'x-business-id': businessId }
      });
      return data;
    },
    enabled: !!businessId,
  });

  // Sync local state when query data is loaded
  useEffect(() => {
    if (services) {
      const xConfig = services.find((s: any) => s.platform === 'TWITTER');
      if (xConfig) {
        setConfig({
          apiKey: xConfig.apiKey,
          apiSecret: xConfig.apiSecret,
          apiTier: xConfig.apiTier || 'free',
          isActive: xConfig.isActive
        });
      }
    }
  }, [services]);

  // React Query way to save config
  const saveMutation = useMutation({
    mutationFn: async (newConfig: typeof config) => {
      if (!businessId) throw new Error('Business ID required');
      return axios.post('/api/settings/services', {
        platform: 'TWITTER',
        ...newConfig
      }, {
        headers: { 'x-business-id': businessId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', businessId] });
      toast.success('Third-party service credentials saved successfully');
    },
    onError: () => {
      toast.error('Failed to save credentials');
    }
  });

  const handleSave = () => {
    saveMutation.mutate(config);
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Third Party Services</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Configure credentials and tiers for integrated platforms.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 flex flex-row items-center gap-4 py-8">
            <div className="h-12 w-12 rounded-2xl bg-slate-950 flex items-center justify-center shadow-lg shadow-slate-900/20">
              <span className="text-white text-xl font-black">X</span>
            </div>
            <div>
              <CardTitle className="text-xl font-bold">X (Twitter)</CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-0.5">
                <Info className="h-3.5 w-3.5" />
                Read the <a href="https://learn.gravitywrite.com/en/article/how-to-connect-post-on-twitter-x-api-integration-3gaecs/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">documentation <ExternalLink className="h-3 w-3" /></a>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2.5">
                <Label htmlFor="apiKey" className="text-xs font-black uppercase tracking-widest text-slate-400">API Key <span className="text-red-500">*</span></Label>
                <Input
                  id="apiKey"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Enter your X API Key"
                  className="h-12 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="apiSecret" className="text-xs font-black uppercase tracking-widest text-slate-400">API Secret <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="apiSecret"
                    type={showXSecret ? "text" : "password"}
                    value={config.apiSecret}
                    onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                    placeholder="Enter your X API Secret"
                    className="h-12 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowXSecret(!showXSecret)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showXSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="tier" className="text-xs font-black uppercase tracking-widest text-slate-400">Tier</Label>
                <Select value={config.apiTier} onValueChange={(val) => setConfig({ ...config, apiTier: val })}>
                  <SelectTrigger className="h-12 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all">
                    <SelectValue placeholder="Select API Tier" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
                    <SelectItem value="legacy">Legacy</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-8">
                <Checkbox
                  id="status"
                  checked={config.isActive}
                  onCheckedChange={(checked) => setConfig({ ...config, isActive: !!checked })}
                  className="h-5 w-5 rounded-md border-slate-300 dark:border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label htmlFor="status" className="text-sm font-bold text-slate-700 dark:text-slate-300">Active</Label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 font-black uppercase tracking-widest text-[10px] transition-all"
              >
                {saveMutation.isPending ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
