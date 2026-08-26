'use client';

import { useQuery } from '@tanstack/react-query';
import { useCurrentBusiness } from './use-current-business';
import { FeatureKey, PlanId, PLANS } from '@/features/billing/config/plans.config';

interface EntitlementsResponse {
  success: boolean;
  businessId: string;
  plan: {
    id: PlanId;
    name: string;
    tier: number;
    features: Record<string, any>;
  };
}

export function useEntitlements(targetFeature?: FeatureKey) {
  const { businessId, isLoading: isBusinessLoading } = useCurrentBusiness();

  const query = useQuery<EntitlementsResponse>({
    queryKey: ['billing-entitlements', businessId],
    queryFn: async () => {
      if (!businessId) {
        return {
          success: true,
          businessId: '',
          plan: {
            id: 'free',
            name: 'Free',
            tier: 0,
            features: PLANS.free.features,
          },
        };
      }

      const res = await fetch(`/api/billing/entitlements?businessId=${encodeURIComponent(businessId)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch entitlements');
      }
      return res.json();
    },
    enabled: !!businessId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });

  const planId: PlanId = (query.data?.plan?.id as PlanId) || 'free';
  const plan = PLANS[planId] || PLANS.free;

  const hasAccess = (feature: FeatureKey): boolean => {
    const featureVal = query.data?.plan?.features?.[feature] ?? plan.features[feature];
    if (typeof featureVal === 'boolean') return featureVal;
    if (typeof featureVal === 'number') return featureVal === -1 || featureVal > 0;
    if (typeof featureVal === 'string') return featureVal !== 'none';
    return false;
  };

  const featureAllowed = targetFeature ? hasAccess(targetFeature) : true;

  return {
    planId,
    plan,
    features: query.data?.plan?.features || plan.features,
    hasAccess,
    isAllowed: featureAllowed,
    isLoading: isBusinessLoading || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
