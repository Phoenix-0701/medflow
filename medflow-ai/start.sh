#!/bin/bash
# Start gRPC server in the background
python backend/grpc_server.py &

# Start FastAPI server in the foreground
uvicorn backend.fastapi_app:app --host 0.0.0.0 --port 8080
