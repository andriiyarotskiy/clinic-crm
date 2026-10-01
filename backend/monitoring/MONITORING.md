# Monitoring setup for Clinic CRM

This document describes how Prometheus and Grafana are configured for the Clinic CRM backend.

## Technology stack

- Backend: Python 3.12 + FastAPI
- Package manager: uv
- Metrics library: prometheus-fastapi-instrumentator

## Architecture

Prometheus and Grafana are deployed as **separate Web Services on Render**, alongside the main backend service. They are not run via docker-compose in production — docker-compose is only used for local development.

| Service    | URL                                              | Purpose                          |
|------------|---------------------------------------------------|-----------------------------------|
| Backend    | https://clinic-crm-5nec.onrender.com              | Main app, exposes `/metrics`      |
| Prometheus | https://clinic-crm-1-snle.onrender.com            | Scrapes and stores metrics        |
| Grafana    | https://grafana-clinic-crm.onrender.com           | Visualizes metrics from Prometheus|

Each is deployed independently from the same GitHub repo, using a different **Root Directory** on Render:

- Backend → `backend/`
- Prometheus → `backend/monitoring/`
- Grafana → `backend/monitoring/grafana/`

## How `/metrics` works

The backend exposes a Prometheus-compatible metrics endpoint at `/metrics` using `prometheus-fastapi-instrumentator`.

- `Instrumentator().instrument(app).expose(app, endpoint="/metrics")` attaches metrics collection to the FastAPI app.
- `/metrics` returns metrics in Prometheus text format.
- No authentication is required on `/metrics`, so Prometheus can scrape it directly.

## What metrics are available

Key metrics available for visualization in Grafana:

- `http_requests_total` — total HTTP requests, labeled by `method`, `path`, and `status`.
- `http_request_duration_seconds` — request latency histogram.
- `http_request_duration_seconds_bucket` — latency bucket counts.
- `http_request_size_bytes` — size of incoming HTTP requests.
- `http_response_size_bytes` — size of HTTP responses.
- `process_cpu_seconds_total` — CPU time consumed by the backend process.
- `process_resident_memory_bytes` — resident memory usage.
- `process_virtual_memory_bytes` — virtual memory usage.
- `python_gc_objects_collected_total` — garbage-collected Python objects.
- `python_gc_objects_uncollectable_total` — uncollectable Python objects.
- `python_info` — Python runtime version information.

## Prometheus configuration

`backend/monitoring/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'clinic-crm'
    metrics_path: /metrics
    scheme: https
    static_configs:
      - targets: ['clinic-crm-5nec.onrender.com']
```

Deployed via `backend/monitoring/Dockerfile`:

```dockerfile
FROM prom/prometheus:latest
COPY prometheus.yml /etc/prometheus/prometheus.yml
```

## Grafana configuration

Deployed via `backend/monitoring/grafana/Dockerfile`:

```dockerfile
FROM grafana/grafana:latest
COPY provisioning /etc/grafana/provisioning
```

The Prometheus datasource is provisioned automatically on startup via `backend/monitoring/grafana/provisioning/datasources/datasource.yml`, pointing to the Prometheus service URL above — no manual setup needed after deploy.

Required environment variables on Render (Grafana service):
- `GF_SECURITY_ADMIN_USER=admin`
- `GF_SECURITY_ADMIN_PASSWORD=<set your own, do not use the default>`
- `GF_USERS_ALLOW_SIGN_UP=false`

## Local development

For local debugging, Prometheus and Grafana can still be run via a `docker-compose.monitoring.yml` file if needed, using the same `prometheus.yml` config with `scheme: http` and an internal target instead of the public Render hostname. This is optional and not required for the production monitoring stack described above.

## How to check things are working

1. Open Prometheus → **Status → Target health**: the `clinic-crm` target should show **UP**.
2. Open Grafana → the `FastAPI Observability` dashboard should show live request counts and latency.
3. Trigger a request against the backend (e.g. open `/docs` or call an endpoint) and confirm the dashboard updates within ~15-30 seconds.

## Notes

- Credentials for Grafana are shared with the team separately (not committed to the repo).
- Add more scrape jobs to `prometheus.yml` if additional services need monitoring.