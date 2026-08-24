{{/*
Expand the name of the chart.
*/}}
{{- define "social-automation.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "social-automation.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "social-automation.labels" -}}
helm.sh/chart: {{ include "social-automation.name" . }}-{{ .Chart.Version | replace "+" "_" }}
{{ include "social-automation.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: ai-social-media-automation
{{- end }}

{{/*
Selector labels
*/}}
{{- define "social-automation.selectorLabels" -}}
app.kubernetes.io/name: {{ include "social-automation.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
