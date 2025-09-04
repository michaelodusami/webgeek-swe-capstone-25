#!/bin/bash
# Development

export ENVIRONMENT=development
fastapi dev main.py
echo "Current directory: $(pwd)"