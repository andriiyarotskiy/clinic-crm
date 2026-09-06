#!/bin/sh

set -e

# Run migrations
alembic upgrade head

# Ensure initial superadmin exists
python src/create_initial_admin.py

# Run web server
uvicorn main:app --host 0.0.0.0 --port 8000
