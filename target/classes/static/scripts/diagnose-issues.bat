@echo off
echo Diagnosing Event Management System Issues...
echo ===========================================

echo.
echo 1. Checking Java Installation...
java -version
if %errorlevel% neq 0 (
    echo ❌ Java not found or not in PATH
) else (
    echo ✅ Java is installed
)

echo.
echo 2. Checking Maven Installation...
mvn --version
if %errorlevel% neq 0 (
    echo ❌ Maven not found or not in PATH
) else (
    echo ✅ Maven is installed
)

echo.
echo 3. Checking MongoDB Connection...
echo Testing MongoDB connection (requires mongod to be running)...
timeout /t 2 >nul
echo ⚠️  Please ensure MongoDB is running on localhost:27017

echo.
echo 4. Compiling Backend...
mvn clean compile -q
if %errorlevel% equ 0 (
    echo ✅ Backend compilation successful
) else (
    echo ❌ Backend compilation failed
    echo Running verbose compilation...
    mvn clean compile
)

echo.
echo 5. Common Issues to Check:
echo    - MongoDB running on localhost:27017?
echo    - Port 7070 not in use?
echo    - Frontend served from localhost:5500 or similar?
echo    - No firewall blocking connections?

echo.
echo 6. Next Steps:
echo    - If compilation successful: run 'mvn spring-boot:run'
echo    - Open browser to http://localhost:7070/api/clubs to test backend
echo    - Open index.html in browser to test frontend

echo.
pause
