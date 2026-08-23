# 🌌 EventOrbit: Smart College Event Management System & RAG AI Assistant

> **Empowering Campus Life Through Seamless Event Management & Intelligent Conversational Retrieval**

EventOrbit is a full-stack, enterprise-grade college event management platform built with **React (Vite)** on the frontend and **Spring Boot 3 (Java 17/21)** on the backend, integrated with a state-of-the-art **Retrieval-Augmented Generation (RAG) AI Assistant** powered by **Google Gemini**.

---

## 🏛️ System Architecture

```mermaid
graph TD
    User([Student / Admin]) <--> Frontend[React + Vite Frontend (Port 5500 / 5173)]
    Frontend <--> |REST API + JWT| Backend[Spring Boot 3 Backend (Port 7070)]
    
    subgraph Backend Architecture
        Backend <--> Security[Spring Security 6 + JWT Auth]
        Backend <--> DB[(MySQL Database - JPA/Hibernate)]
        
        subgraph RAG AI Assistant Engine
            ChatController[Chat Controller] --> QueryProcessor[1. Query Processor & Intent Router]
            
            QueryProcessor --> |Student & Live Data| DatabaseSqlAgent[2. Database SQL Agent]
            DatabaseSqlAgent --> DB
            
            QueryProcessor --> |College Knowledge| KnowledgeChunker[3. Knowledge Chunker]
            KnowledgeChunker <--> VectorIndex[4. Semantic Vector Index & Cache]
            
            VectorIndex <--> EmbeddingEngine[5. Semantic Embedding Engine (Gemini / OpenAI)]
            
            KnowledgeChunker & DatabaseSqlAgent --> HybridReranker[6. Hybrid Reranker (Lexical + Semantic)]
            HybridReranker --> ChatService[7. Chat Service (Strict Grounding & Privacy)]
            ChatService --> GeminiLLM[Google Gemini 2.0 Flash API]
        end
    end
```

---

## 🚀 Key Features

### 1. 🎓 Core Event & Club Management
- **Role-Based Access Control**: Separate, secure workflows for **Students**, **Club Admins**, and **Super Admins**.
- **Interactive Club Hub**: Explore college clubs (Coding Club, Robotics Club, Cultural Club, etc.), leadership, and upcoming fests.
- **Team & Solo Event Registrations**: Create teams, add member USNs, track deadlines, and receive instant confirmation.
- **Results & Winners Podium**: Official leaderboard for event winners with position display (1st, 2nd, 3rd) while protecting private student data.
- **Participation History**: Personal dashboard for students to view, track, and manage registered events and individual winnings.

### 2. 🤖 Enterprise RAG AI Assistant
- **5-Layer Architecture**:
  1. **Greeting & Privacy Defense**: Zero-leakage policy preventing prompt injection or unauthorized access to student USNs/records.
  2. **JPA Direct DB Querying**: Live event schedules, venue info, active registration windows, and club affiliations.
  3. **Personal Participation Context**: Secure, authenticated context queries for logged-in students.
  4. **Multi-Strategy Hybrid Retrieval**: Combines BM25 lexical keyword matching with cosine similarity semantic embeddings.
  5. **Dynamic Knowledge Synchronization**: Instant live re-indexing when [`knowledge.txt`](file:///d:/Event%20Management/backend/src/main/resources/knowledge.txt) is modified on disk.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router, Lucide Icons, Glassmorphic Vanilla CSS |
| **Backend** | Java 17/21, Spring Boot 3.2.0, Spring Data JPA, Spring Security 6 |
| **Database** | MySQL 8.0, Hibernate ORM |
| **AI / RAG** | Google Gemini 2.0 Flash, Gemini Text Embeddings (`models/embedding-001`), Jackson JSON |
| **Authentication** | JWT (JSON Web Tokens) with HMAC-SHA256 |
| **Build Tools** | Maven 3.9+, Node.js 18+ |

---

## 📁 Project Directory Structure

```text
Event Management/
├── backend/
│   ├── src/
│   │   ├── main/java/com/mvjce/eventmanagement/
│   │   │   ├── config/              # Security & CORS configuration
│   │   │   ├── controller/          # REST API endpoints (Events, Clubs, Auth, Chat)
│   │   │   ├── dto/                 # Data transfer objects & Source metadata
│   │   │   ├── model/               # JPA Entities (Event, Club, User, Winner, Team)
│   │   │   ├── repository/          # Spring Data JPA Repositories
│   │   │   ├── rag/                 # RAG AI Engine (Processor, Chunker, Embeddings, Index)
│   │   │   └── service/             # Business Logic & Gemini LLM Client
│   │   ├── main/resources/
│   │   │   ├── application.properties
│   │   │   └── knowledge.txt        # Live College Knowledge Base & FAQs
│   │   └── test/java/               # Unit & Connectivity Test Suites
│   ├── data/vector-cache/           # Persistent local semantic vector index
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Navbar, Sidebar, Modals, Chatbot UI
│   │   ├── pages/                   # Dashboard, Events, Clubs, Results, Profile
│   │   ├── services/                # Axios API Services
│   │   └── index.css                # Glassmorphic Design System
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🏁 Getting Started

### 1. Prerequisites
- **Java 17** or **Java 21**
- **Node.js 18+** & **npm**
- **MySQL 8.0+**
- **Google AI Studio API Key** (Gemini)

### 2. Database Configuration
Create a database in MySQL:
```sql
CREATE DATABASE EVENTMANAGEMENT;
```
Configure your credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/EVENTMANAGEMENT
spring.datasource.username=root
spring.datasource.password=your_mysql_password
```

### 3. Backend Setup & Run
```powershell
cd "d:\Event Management\backend"

# Set your Gemini API key in the environment
$env:OPENAI_API_KEY="your_google_gemini_api_key"

# Run tests
mvn test

# Start the Spring Boot Backend (Port 7070)
mvn spring-boot:run
```

### 4. Frontend Setup & Run
```powershell
cd "d:\Event Management\frontend"

# Install dependencies
npm install

# Start Vite Dev Server (Port 5500 or 5173)
npm run dev
```

Open your browser at `http://localhost:5500` or `http://localhost:5173`.

---

## 🔐 Default Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin` | `admin123` |
| **Student** | `1MJ23CG011` / `student` | `1234` |

---

## 📄 License
Distributed under the **MIT License**.
