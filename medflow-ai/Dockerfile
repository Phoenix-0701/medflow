FROM python:3.10-slim

WORKDIR /app

# Install system dependencies if required by some python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x start.sh

EXPOSE 8080 50051

CMD ["bash", "-c", "python backend/grpc_server.py & uvicorn backend.fastapi_app:app --host 0.0.0.0 --port 8080"]
