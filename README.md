# College Event Management System

A full-stack web application for managing college events with student registration functionality.

## Technology Stack

### Backend
- **Spring Boot 3.2.0** - Java framework
- **MongoDB** - NoSQL database
- **Spring Security** - Authentication and authorization
- **JWT (JSON Web Tokens)** - Token-based authentication
- **Maven** - Dependency management

### Frontend
- **HTML5, CSS3, JavaScript** - Client-side technologies
- **Responsive Design** - Mobile-friendly interface

## Prerequisites

1. **Java 17** or higher
2. **Maven 3.6** or higher
3. **MongoDB** installed and running on localhost:27017
4. **Modern web browser** with JavaScript enabled

## Setup Instructions

### 1. Database Setup

Make sure MongoDB is installed and running:
```bash
# Start MongoDB (if not already running)
mongod
```

### 2. Backend Setup

1. Navigate to the project directory:
```bash
cd "c:\Users\darsh\OneDrive\Desktop\Event Management"
```

2. Build and run the Spring Boot application:
```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

1. Open the `index.html` file in your web browser:
```bash
# Option 1: Double-click the index.html file
# Option 2: Use a live server extension in VS Code
# Option 3: Use Python's built-in server
python -m http.server 5500
```

2. The frontend will be available at `http://localhost:5500` (or similar)

## Default Credentials

- **Username**: `student`
- **Password**: `1234`

## Features

### Student Features
- ✅ Login and authentication
- ✅ View all clubs with images
- ✅ Browse events by club
- ✅ Register for events
- ✅ View recent events and notifications
- ✅ Account management
- ✅ Responsive design for mobile devices

### Backend Features
- ✅ RESTful API endpoints
- ✅ JWT-based authentication
- ✅ MongoDB data persistence
- ✅ Automatic data initialization
- ✅ CORS support for frontend integration
- ✅ Input validation and sanitization

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Clubs
- `GET /api/clubs` - Get all clubs
- `GET /api/clubs/{id}` - Get club by ID
- `POST /api/clubs` - Create new club
- `PUT /api/clubs/{id}` - Update club
- `DELETE /api/clubs/{id}` - Delete club

### Events
- `GET /api/events` - Get all events
- `GET /api/events/club/{clubId}` - Get events by club
- `GET /api/events/{id}` - Get event by ID
- `POST /api/events` - Create new event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event
- `POST /api/events/{id}/register` - Register for event

## Database Collections

### Users Collection
```json
{
  "_id": "string",
  "username": "string",
  "password": "hashed_string",
  "role": "USER",
  "mobile": "string",
  "enabled": true
}
```

### Clubs Collection
```json
{
  "_id": "string",
  "name": "string",
  "imageUrl": "string"
}
```

### Events Collection
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "clubId": "string",
  "regStart": "datetime",
  "regEnd": "datetime",
  "bgImageUrl": "string",
  "registrations": [
    {
      "username": "string",
      "mobile": "string",
      "registrationTime": "datetime"
    }
  ]
}
```

## Configuration

### Application Properties
The backend configuration is in `src/main/resources/application.properties`:

```properties
# MongoDB Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/event_management

# Server Configuration
server.port=8080

# JWT Configuration
jwt.secret=mySecretKey
jwt.expiration=86400000

# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:5500,http://127.0.0.1:5500
```

## Security Features

- Password hashing with BCrypt
- JWT token-based authentication
- CORS protection
- Input validation and sanitization
- SQL injection prevention (NoSQL injection protection)
- XSS protection with input sanitization

## Development

### Running in Development Mode

1. Start MongoDB
2. Run the Spring Boot backend: `mvn spring-boot:run`
3. Open the frontend in a browser or serve with a web server

### Adding New Features

1. **Backend**: Add new endpoints in controllers
2. **Frontend**: Update JavaScript to call new API endpoints
3. **Database**: Add new collections or fields as needed

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running on localhost:27017
   - Check the database URI in application.properties

2. **CORS Issues**
   - Verify the allowed origins in application.properties
   - Check that the frontend URL matches the CORS configuration

3. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT secret configuration
   - Verify user credentials in database

4. **Frontend Not Loading**
   - Ensure backend is running on port 8080
   - Check browser console for JavaScript errors
   - Verify API_BASE_URL in the frontend code

## Project Structure

```
Event Management/
├── pom.xml                                    # Maven dependencies
├── src/
│   └── main/
│       ├── java/com/mvjce/eventmanagement/
│       │   ├── EventManagementApplication.java
│       │   ├── config/                         # Security and data config
│       │   ├── controller/                     # REST API endpoints
│       │   ├── model/                          # Data models
│       │   ├── repository/                     # Database repositories
│       │   └── service/                        # Business logic
│       └── resources/
│           └── application.properties          # Configuration
├── index.html                                 # Frontend application
└── README.md                                  # This file
```

## License

This project is created for educational purposes.
