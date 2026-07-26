@echo off
echo Testing Spring Boot Backend...
echo ================================

:: Check if Maven is installed
mvn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Maven is not installed. Please install Maven first.
    pause
    exit /b 1
)

:: Check Java version
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Java is not installed. Please install Java 17 or higher.
    pause
    exit /b 1
)

echo ✓ Java is installed
echo ✓ Maven is installed

:: Clean and compile the project
echo Cleaning and compiling...
mvn clean compile

if %errorlevel% equ 0 (
    echo ✓ Compilation successful
) else (
    echo ✗ Compilation failed
    pause
    exit /b 1
)

echo Backend setup complete! You can now run: mvn spring-boot:run
pause
