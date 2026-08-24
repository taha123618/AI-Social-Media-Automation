"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UseLogsOptions {
   page: number;
   limit: number;
   search?: string;
   [key: string]: any;
}

export function useActivityLogs(options: UseLogsOptions) {
   return useQuery({
      queryKey: ["system", "activity", options],
      queryFn: async () => {
         const params = new URLSearchParams({
            page: options.page.toString(),
            limit: options.limit.toString(),
            ...(options.search && { search: options.search }),
            ...(options.entity && { entity: options.entity }),
         });
         const res = await fetch(`/api/admin/system/logs/activity?${params}`);
         if (!res.ok) throw new Error("Failed to fetch activity logs");
         return res.json();
      },
   });
}

export function useErrorLogs(options: UseLogsOptions) {
   return useQuery({
      queryKey: ["system", "errors", options],
      queryFn: async () => {
         const params = new URLSearchParams({
            page: options.page.toString(),
            limit: options.limit.toString(),
            ...(options.search && { search: options.search }),
            ...(options.source && { source: options.source }),
            ...(options.resolved !== undefined && { resolved: options.resolved.toString() }),
         });
         const res = await fetch(`/api/admin/system/logs/errors?${params}`);
         if (!res.ok) throw new Error("Failed to fetch error logs");
         return res.json();
      },
   });
}

export function useAuditLogs(options: UseLogsOptions) {
   return useQuery({
      queryKey: ["system", "audit", options],
      queryFn: async () => {
         const params = new URLSearchParams({
            page: options.page.toString(),
            limit: options.limit.toString(),
            ...(options.search && { search: options.search }),
            ...(options.action && { action: options.action }),
            ...(options.status && { status: options.status }),
         });
         const res = await fetch(`/api/admin/system/logs/audit?${params}`);
         if (!res.ok) throw new Error("Failed to fetch audit logs");
         return res.json();
      },
   });
}

export function useSystemMetrics(timeframe: string = "24h") {
   return useQuery({
      queryKey: ["system", "metrics", timeframe],
      queryFn: async () => {
         const res = await fetch(`/api/admin/system/metrics?timeframe=${timeframe}`);
         if (!res.ok) throw new Error("Failed to fetch system metrics");
         return res.json();
      },
      refetchInterval: 30000, // Poll every 30 seconds for metrics
   });
}

export function useQueueStats() {
   return useQuery({
      queryKey: ["system", "queues"],
      queryFn: async () => {
         const res = await fetch(`/api/admin/system/queues`);
         if (!res.ok) throw new Error("Failed to fetch queue stats");
         return res.json();
      },
      refetchInterval: 5000, // Poll every 5 seconds for real-time updates
   });
}


export function useResolveError() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({ id, resolved }: { id: string; resolved: boolean }) => {
         const res = await fetch(`/api/admin/system/logs/errors/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resolved }),
         });
         if (!res.ok) throw new Error("Failed to update error log");
         return res.json();
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["system", "errors"] });
         queryClient.invalidateQueries({ queryKey: ["system", "audit"] });
      },
   });
}

export function useDeleteError() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (id: string) => {
         const res = await fetch(`/api/admin/system/logs/errors/${id}`, {
            method: "DELETE",
         });
         if (!res.ok) throw new Error("Failed to delete error log");
         return res.json();
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["system", "errors"] });
         queryClient.invalidateQueries({ queryKey: ["system", "audit"] });
      },
   });
}
