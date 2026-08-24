# Operations Alerting & Remediation Runbook

This runbook outlines standard operating procedures for investigating and resolving alerts triggered by Prometheus and Alertmanager.

---

## 🚨 1. AppDown (Severity: Critical)

- **Meaning**: Next.js Web App instance has stopped responding on `/api/metrics` or `/api/health` for >1 minute.
- **Potential Causes**:
  1. Node.js process crashed or was OOM-killed.
  2. Container or Kubernetes Pod terminated.
  3. Reverse proxy / Ingress configuration issue.
- **Investigation Steps**:
  ```bash
  # In Kubernetes
  kubectl get pods -n social-automation
  kubectl describe pod <pod-name> -n social-automation
  kubectl logs <pod-name> -n social-automation --tail=100

  # In Docker / PM2
  pm2 status
  docker ps
  pm2 logs ai_social_media_automation --lines 100
  ```
- **Remediation**:
  1. Restart the pod/process: `kubectl rollout restart deployment/app-web -n social-automation` or `pm2 reload ecosystem.config.cjs`.
  2. Verify `/api/health` returns HTTP 200 via `./scripts/healthcheck.sh`.

---

## 🗄️ 2. DatabaseDisconnected (Severity: Critical)

- **Meaning**: PostgreSQL query execution failed or timed out during the health probe.
- **Potential Causes**:
  1. PostgreSQL container or StatefulSet pod stopped.
  2. Connection pool exhausted (`max_connections` reached).
  3. Network policy or security group blocking port 5432.
- **Investigation Steps**:
  ```bash
  # Check PostgreSQL pod status
  kubectl get statefulset postgres -n social-automation
  kubectl logs statefulset/postgres -n social-automation --tail=100

  # Test connectivity directly
  pg_isready -h localhost -p 5432
  ```
- **Remediation**:
  1. If PostgreSQL restarted or disk is full, check PVC volume capacity: `df -h`.
  2. Scale or restart PostgreSQL pod: `kubectl rollout restart statefulset/postgres -n social-automation`.

---

## ⏱️ 3. HighDatabaseLatency (Severity: Warning)

- **Meaning**: Database ping or query latency exceeded 500ms for over 2 minutes.
- **Potential Causes**:
  1. Heavy pgvector cosine similarity search queries running unindexed.
  2. Large batch analytical queries locking tables.
  3. Disk I/O bottleneck.
- **Remediation**:
  1. Check slow queries: `SELECT pid, query, age(clock_timestamp(), query_start) FROM pg_stat_activity WHERE state != 'idle' ORDER BY age DESC LIMIT 5;`.
  2. Check pgvector index status on `KnowledgeChunk`.

---

## 🧠 4. HighMemoryUsage (Severity: Warning)

- **Meaning**: Node.js heap memory usage exceeded 90% of total allocated heap.
- **Potential Causes**:
  1. Large in-memory file buffers during video/image processing.
  2. Memory leak in background timers or event listeners.
- **Remediation**:
  1. Ensure heavy jobs are offloaded to BullMQ background workers.
  2. Verify Node heap space is configured with `--max-old-space-size=8192`.
  3. Rolling restart of worker/app pods.
