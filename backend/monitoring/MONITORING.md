# Monitoring setup for Clinic CRM

This document describes how to configure Prometheus and Grafana for the Clinic CRM backend.

## Technology stack

- Backend: Python 3.12 + FastAPI
- Package manager: uv
- Metrics library: prometheus-fastapi-instrumentator

## Prometheus configuration

Use `prometheus.yml` to configure Prometheus scraping for the FastAPI app.

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'clinic-crm'
    metrics_path: /metrics
    scheme: https
    static_configs:
      - targets: ['your-app-name.onrender.com']
```

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

## Running Prometheus + Grafana with Docker Compose

Create a `docker-compose.monitoring.yml` file and use it to run Prometheus and Grafana side-by-side.

Example `docker-compose.monitoring.yml`:

```yaml
version: '3.9'
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
    ports:
      - '9090:9090'

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - '3000:3000'
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

Start the monitoring stack:

```bash
docker compose -f docker-compose.monitoring.yml up -d
```

Open:

- Prometheus UI: `http://localhost:9090`
- Grafana UI: `http://localhost:3000`

## Notes

- Replace `your-app-name.onrender.com` with your actual Render hostname.
- Keep `/metrics` accessible by Prometheus.
- Add more scrape jobs for other services as needed.
