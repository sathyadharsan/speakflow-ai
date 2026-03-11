# SpeakFlow AI Backend

This is the Spring Boot backend for SpeakFlow AI, providing authentication, dashboard statistics, and AI-powered speaking analysis.

## Technologies
- Java 17+
- Spring Boot 3.2.3
- Spring Security + JWT
- PostgreSQL
- Hibernate / JPA
- Maven

## Getting Started

1. **Database Setup**:
   - Ensure PostgreSQL is running.
   - Create a database named `speakflow_ai`.
   - Default credentials are `postgres`/`postgres`. Update in `src/main/resources/application.properties` if needed.

2. **Run Application**:
   ```bash
   mvn spring-boot:run
   ```
   The backend will start on [http://localhost:8080](http://localhost:8080).

## REST APIs

### Authentication
- `POST /api/auth/signup`: Register a new user.
- `POST /api/auth/login`: Login and receive a JWT token.

### User Data (Authenticated)
- `GET /api/dashboard`: Fetch user statistics (streak, sessions, confidence).
- `POST /api/speaking/analyze`: Analyze a spoken sentence and get AI corrections.

## Frontend Connection
The frontend in the root directory is configured to connect to this backend. Ensure both the Vite dev server (port 3000) and this Spring Boot server (port 8080) are running.
