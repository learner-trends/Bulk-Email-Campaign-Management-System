@echo off
echo ==============================================
echo   Bulk Email Campaign Management System
echo ==============================================

where java >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java not found. Please install JDK 17 or higher.
    pause
    exit /b 1
)

where mvn >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Maven not found. Please install Maven 3.8+
    echo Download from: https://maven.apache.org/download.cgi
    pause
    exit /b 1
)

echo.
echo Step 1: Creating data directory...
if not exist "data" mkdir data

echo Step 2: Building application...
call mvn clean package -DskipTests -q

echo Step 3: Starting application...
echo.
echo   Application URL: http://localhost:8080
echo   Press Ctrl+C to stop
echo.

java -jar target\bulk-email-campaign-1.0.0.jar
pause
