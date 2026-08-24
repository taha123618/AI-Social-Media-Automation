'use client';

import { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface CrmIntegrationPanelProps {
  businessId: string | null;
}

export function CrmIntegrationPanel({ businessId }: CrmIntegrationPanelProps) {
  const [status, setStatus] = useState<string>('checking');
  const [crmType, setCrmType] = useState<string>('GOHIGHLEVEL');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (businessId) {
      checkStatus();
    }
  }, [businessId]);

  const checkStatus = async () => {
    try {
      const res = await fetch(`/api/crm?businessId=${businessId}`);
      const result = await res.json();
      if (result.success) {
        setStatus('connected');
      } else {
        setStatus('not_connected');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'SYNC_CONTACTS', 
          businessId,
          crmType 
        })
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || 'Sync initiated successfully');
      } else {
        toast.error('Failed to initiate sync');
      }
    } catch (error) {
      toast.error('An error occurred during sync');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight mb-2">CRM Integration</h2>
        <p className="text-slate-500 font-medium">Connect your lead management system to automate follow-ups.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-slate-200 shadow-none rounded-[2rem]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">External CRM Connection</CardTitle>
              {status === 'connected' ? (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-slate-500">
                  <AlertCircle className="h-3 w-3 mr-1" /> Disconnected
                </Badge>
              )}
            </div>
            <CardDescription>
              Automatically export leads captured from social media to your preferred CRM.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Select CRM Provider</label>
              <Select value={crmType} onValueChange={setCrmType}>
                <SelectTrigger className="w-full rounded-xl border-slate-200 h-12">
                  <SelectValue placeholder="Choose a CRM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GOHIGHLEVEL">GoHighLevel</SelectItem>
                  <SelectItem value="HUBSPOT">HubSpot</SelectItem>
                  <SelectItem value="SALESFORCE">Salesforce</SelectItem>
                  <SelectItem value="GENERIC">Other (Webhook)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleSync} 
                disabled={isLoading || !businessId}
                className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl font-bold gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Sync Now
              </Button>
              <Button variant="outline" className="h-12 px-8 rounded-xl font-bold gap-2 border-slate-200">
                Configure Webhooks
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-none shadow-none rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-lg text-black font-bold">Why connect a CRM?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-blue-600 text-xs font-bold">1</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Instant lead capture from DMs and comments.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-blue-600 text-xs font-bold">2</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Automated email/SMS follow-up sequences.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-blue-600 text-xs font-bold">3</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Track revenue attribution from post to sale.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
