@echo off
chcp 65001 > nul
set PYTHONIOENCODING=utf-8
set PYTHONUNBUFFERED=1
echo ========================================================
echo       Khoi dong MedFlow AI Microservice
echo ========================================================
echo.

cd /d "%~dp0medflow-ai"

if not exist "venv\Scripts\activate.bat" (
    echo [*] Lan dau khoi dong: Dang tao Python Virtual Environment...
    python -m venv venv
)
call .\venv\Scripts\activate.bat
pip install --quiet -r requirements.txt

echo [1/2] Dang khoi dong AI Backend (gRPC Server)...
start "MedFlow AI - gRPC Server (50051)" cmd /k "set HF_ENDPOINT=https://hf-mirror.com && .\venv\Scripts\activate.bat && python backend\grpc_server.py"

timeout /t 3 /nobreak > nul

echo [2/2] Dang khoi dong API Gateway (FastAPI)...
start "MedFlow AI - Gateway (8080)" cmd /k ".\venv\Scripts\activate.bat && uvicorn backend.fastapi_app:app --port 8080"

echo.
echo ========================================================
echo Hoan tat! Dich vu AI da san sang.
echo ========================================================
pause
