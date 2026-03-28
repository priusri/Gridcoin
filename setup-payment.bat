@echo off
echo ======================================
echo Gridcoin Payment Gateway Setup Script
echo ======================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm version: %NPM_VERSION%
echo.

REM Backend setup
echo 📦 Setting up backend...
cd backend

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo ✅ Backend dependencies installed

REM Check if .env exists
if not exist ".env" (
    echo.
    echo ⚠️  No .env file found in backend/
    echo Creating .env from .env.example...
    copy .env.example .env
    echo ✅ .env created - please update with your Razorpay credentials
)

cd ..

REM Frontend setup
echo.
echo 📦 Setting up frontend...
cd frontend

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo ✅ Frontend dependencies installed

REM Check if .env exists
if not exist ".env" (
    echo.
    echo ⚠️  No .env file found in frontend/
    echo Creating .env from .env.example...
    copy .env.example .env
    echo ✅ .env created - please update with your Razorpay public key
)

cd ..

echo.
echo ======================================
echo ✅ Setup Complete!
echo ======================================
echo.
echo Next steps:
echo 1. Update backend\.env with your Razorpay credentials
echo 2. Update frontend\.env with your Razorpay public key
echo 3. Start MongoDB (if using local MongoDB)
echo 4. Start backend: cd backend ^&^& npm run dev
echo 5. Start frontend: cd frontend ^&^& npm start
echo.
echo For detailed instructions, see PAYMENT_INTEGRATION_GUIDE.md
echo.
pause
