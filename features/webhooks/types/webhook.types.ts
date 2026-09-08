export type WebhookEvent =
  | 'post.published'
  | 'post.scheduled'
  | 'blog.generated'
  | 'lead.captured'
  | 'review.received'
  | 'workflow.completed';

export interface WebhookEndpoint {
  id: string;
  businessId: string;
  url: string;
  description?: string;
  secret: string; // HMAC secret
  events: WebhookEvent[];
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
}

export interface WebhookDeliveryLog {
  id: string;
  endpointId: string;
  event: WebhookEvent;
  payload: Record<string, any>;
  statusCode?: number;
  responseBody?: string;
  durationMs: number;
  status: 'DELIVERED' | 'FAILED';
  errorMessage?: string;
  deliveredAt: string;
}

export interface CreateWebhookEndpointInput {
  businessId: string;
  url: string;
  description?: string;
  events: WebhookEvent[];
}

export interface DispatchWebhookPayload {
  businessId: string;
  event: WebhookEvent;
  data: Record<string, any>;
}
