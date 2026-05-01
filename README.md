# 🌌 EventOrbit: College Event Management System

![EventOrbit Banner](file:///C:/Users/darsh/.gemini/antigravity/brain/e61fa30b-0661-4ceb-9616-161c31874050/event_orbit_dashboard_mockup_1777641694855.png)

> **Empowering Campus Life Through Seamless Event Management**

EventOrbit is a modern, full-stack event management portal designed for colleges. It provides a sleek, glassmorphic interface for students to discover, register for, and track campus events while offering administrators powerful tools to manage clubs and event logistics.

---

### 🚀 Key Features

- **✨ Modern UI/UX**: A premium glassmorphic design that feels alive and responsive.
- **🛡️ Secure Access**: JWT-based authentication with role-based access control (Student, Club Admin, Super Admin).
- **📅 Event Discovery**: Browse events by club, category, or date with real-time updates.
- **📝 Easy Registration**: One-click registration for individuals and teams.
- **🤖 Smart Assistant**: Integrated AI chatbot to answer student queries about college rules and event details.
- **📊 Admin Dashboard**: Comprehensive management of clubs, events, registrations, and winner announcements.

---

### 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | ![Java](https://img.shields.io/badge/Java-17-orange) ![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.0-green) ![Spring Security](https://img.shields.io/badge/Spring_Security-6-brightgreen) |
| **Frontend** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26) ![CSS3](https://img.shields.io/badge/CSS3-1572B6) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E) |
| **Database** | ![MySQL](https://img.shields.io/badge/MySQL-4479A1) ![Hibernate](https://img.shields.io/badge/Hibernate-59666C) |
| **Auth** | ![JWT](https://img.shields.io/badge/JWT-black) |
| **AI** | ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-blue) |

---

### 🏁 Getting Started

#### Prerequisites
- **Java 17** or higher
- **Maven 3.6+**
- **MySQL 8.0+**
- **Node.js** (optional, for advanced frontend tooling)

#### 1. Database Configuration
Create a database named `EVENTMANAGEMENT` in MySQL and update the secrets in `src/main/resources/application.properties` (or use the `.example` file).

#### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/your-repo/event-orbit.git

# Navigate to project
cd event-orbit

# Install dependencies and build
mvn clean install

# Run the application
mvn spring-boot:run
```
*The API will be available at `http://localhost:7070`*

#### 3. Frontend Setup
Simply serve the root directory using any web server:
```bash
# Using Python
python -m http.server 5500
```
*Access the portal at `http://localhost:5500`*

---

### 🔐 Default Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin` | `admin123` |
| **Student** | `student` | `1234` |

---

### 📁 Project Structure

```text
EventOrbit/
├── src/main/java/          # Spring Boot Backend Source
├── src/main/resources/     # Configuration & Static Assets
│   ├── static/             # Frontend HTML/CSS/JS
│   └── application.properties
├── backups/                # Database and file backups
├── logs/                   # Application logs
└── pom.xml                 # Maven configuration
```

---

### 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

---

### 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Developed with ❤️ for a better campus experience.
</p>
