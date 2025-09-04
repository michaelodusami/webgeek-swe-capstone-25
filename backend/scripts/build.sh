#!/bin/bash
echo "Current directory: $(pwd)"

docker build --platform=linux/amd64 -t container.cs.vt.edu/modusami03/webgeek-cs3704-summer25/fastapi .
docker push --platform=linux/amd64 container.cs.vt.edu/modusami03/webgeek-cs3704-summer25/fastapi      