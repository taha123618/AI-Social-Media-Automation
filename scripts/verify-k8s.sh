#!/bin/bash
# ==============================================================================
# Kubernetes Cluster Diagnostic & Verification Script
# Checks Namespace, Pod Health, PVC Status, HPA, and Ingress
# ==============================================================================

set -euo pipefail

NAMESPACE="${1:-social-automation}"

echo "☸️ Inspecting Kubernetes Namespace: ${NAMESPACE}..."

echo ""
echo "📦 Pod Statuses:"
kubectl get pods -n "${NAMESPACE}" -o wide

echo ""
echo "🔌 Services & Ingress:"
kubectl get svc,ingress -n "${NAMESPACE}"

echo ""
echo "📈 Horizontal Pod Autoscalers:"
kubectl get hpa -n "${NAMESPACE}" || echo "No HPA configured."

echo ""
echo "💾 Persistent Volume Claims:"
kubectl get pvc -n "${NAMESPACE}"

echo ""
echo "🔒 Network Policies & Disruption Budgets:"
kubectl get networkpolicy,pdb -n "${NAMESPACE}" || true

echo ""
echo "✅ Verification completed."
