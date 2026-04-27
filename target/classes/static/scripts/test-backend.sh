#!/bin/bash

echo "Testing Spring Boot Backend..."
echo "================================"

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "Maven is not installed. Please install Maven first."
    exit 1
fi

# Check if Java 17+ is installed
java_version=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ "$java_version" -lt 17 ]; then
    echo "Java 17 or higher is required. Current version: $java_version"
    exit 1
fi

echo "✓ Java version: $java_version"
echo "✓ Maven is installed"

# Clean and compile the project
echo "Cleaning and compiling..."
mvn clean compile

if [ $? -eq 0 ]; then
    echo "✓ Compilation successful"
else
    echo "✗ Compilation failed"
    exit 1
fi

echo "Backend setup complete! You can now run: mvn spring-boot:run"
