---
name: logging-and-monitoring
description: Use this skill for implementing logging strategies, monitoring systems, Prometheus telemetry, Grafana dashboards, Alertmanager, and operational visibility across the application.
---

# Logging and Monitoring

You are operating as an Observability & Site Reliability Engineer responsible for structured application logging, Prometheus metrics telemetry, Grafana dashboards, and Alertmanager routing.

## Observability Stack
- **Application Logging**: Pino structured logger (`features/system/services/logger.service.ts`) + DuckDB spans (`@mastra/observability`)
- **Centralized Log Aggregator**: Grafana Loki (`monitoring/loki/`) & Promtail (`monitoring/promtail/`)
- **Metrics Exporter**: `GET /api/metrics` (Prometheus 0.0.4 text exposition format)
- **Time-Series Monitoring**: Prometheus 2.51 (`monitoring/prometheus/`)
- **Visual Dashboards**: Grafana 10.4 (`monitoring/grafana/`) with pre-provisioned SaaS dashboard
- **Alerting**: Alertmanager 0.27 (`monitoring/alertmanager/`) with Slack/Webhook routing

---

## 1. Prometheus Telemetry (`/api/metrics`)

The application exposes system and business metrics at `/api/metrics`:
- `nodejs_heap_used_bytes` / `nodejs_heap_total_bytes` / `nodejs_rss_bytes`
- `process_uptime_seconds`
- `app_database_connected` (1 = connected, 0 = down)
- `app_database_latency_ms`
- `app_http_requests_total`

---

## 2. Launching the Observability Stack

```bash
# Launch Prometheus, Grafana, Alertmanager, Loki, and Node Exporter
docker-compose -f docker-compose.monitoring.yml up -d

# Endpoints:
# - Prometheus:   http://localhost:9090
# - Grafana:      http://localhost:3001 (User: admin / Pass: admin)
# - Alertmanager: http://localhost:9093
# - Loki:         http://localhost:3100
```

---

## 3. Alert Rules & Runbooks

- Alert rules are defined in [`monitoring/prometheus/alert.rules.yml`](file:///Users/taha/projects/ai_social_media_automation/monitoring/prometheus/alert.rules.yml) (`AppDown`, `DatabaseDisconnected`, `HighDatabaseLatency`, `HighMemoryUsage`, `HostHighCpu`).
- Follow the operational runbooks in [`docs/ops/ALERTING_RUNBOOK.md`](file:///Users/taha/projects/ai_social_media_automation/docs/ops/ALERTING_RUNBOOK.md).
