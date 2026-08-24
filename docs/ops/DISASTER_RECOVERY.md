# Disaster Recovery & Business Continuity (BC/DR) Plan

## 1. Objectives & SLAs
- **Recovery Point Objective (RPO)**: `< 24 Hours` (Target: `< 1 Hour` with automated backups).
- **Recovery Time Objective (RTO)**: `< 15 Minutes` to restore full service operations.

---

## 2. Backup Architecture & Strategy

1. **Automated Daily Backups**:
   - Automated by `./scripts/backup-db.sh` executing `pg_dump` with gzip compression.
   - 7-day local retention policy.
   - S3 sync capability to offsite encrypted bucket (`social-media-automation-assets/backups/`).
2. **Kubernetes Persistent Volume Snapshots**:
   - VolumeSnapshotClass configured for 20Gi `postgres-storage` PVC.
3. **Application State & Secrets**:
   - Git-versioned infrastructure (`k8s/`, `infrastructure/kubernetes/`, `Dockerfile`, `docker-compose.yml`).
   - Secrets managed through encrypted CI/CD secrets and cloud parameter stores.

---

## 3. Disaster Recovery Procedures

### Scenario A: Database Corruption or Data Loss
```bash
# 1. Retrieve latest backup archive
ls -lt ./backups/postgres/

# 2. Execute safe restoration
./scripts/restore-db.sh ./backups/postgres/social_automation_backup_YYYYMMDD_HHMMSS.sql.gz

# 3. Verify database tables and schema
bun run setup
```

### Scenario B: Kubernetes Cluster Failover
```bash
# 1. Connect kubectl context to secondary / recovery cluster
kubectl config use-context recovery-cluster

# 2. Deploy infrastructure via Kustomize
kubectl apply -k infrastructure/kubernetes/overlays/production/

# 3. Restore data from latest S3 backup
./scripts/restore-db.sh <downloaded_s3_backup.sql.gz>

# 4. Verify deployment health
./scripts/healthcheck.sh
```

### Scenario C: Instant Deployment Rollback
```bash
# In Kubernetes
kubectl rollout undo deployment/app-web -n social-automation
kubectl rollout undo deployment/app-worker -n social-automation

# In PM2 / VPS
pm2 reload ecosystem.config.cjs
```
