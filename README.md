# 🎓 PIMS - Project Information Management System

<div align="center">
  <img src="https://img.shields.io/badge/.NET-8.0-blue?style=for-the-badge&logo=.net" alt=".NET" />
  <img src="https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/SQL_Server-2022-red?style=for-the-badge&logo=microsoft-sql-server" alt="SQL Server" />
  <img src="https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker" alt="Docker" />
</div>

<br />

## 📖 Overview
**PIMS (Project Information Management System)** is a comprehensive web application designed specifically for the **SWP391 Course**. It streamlines the process of managing student project implementations, facilitating seamless coordination between administrators, lecturers, and students.

## ✨ Key Features
- **👥 User & Group Management**: Robust system for handling user roles, forming groups with member limits, and processing group invitations.
- **📅 Course & Semester Administration**: Tools for initializing semesters, creating syllabi, and setting crucial project deadlines.
- **📊 Grading & Assessment**: Secure workflows for evaluating projects, saving grades, and enforcing authorization rules.
- **🔐 Secure Authentication**: Integrated with Google OAuth 2.0 and JWT tokens for secure and seamless access.
- **☁️ Cloud-Ready Deployment**: Pre-configured with Docker Compose and Cloudflare Zero Trust for secure, containerized deployment.

## 🛠️ Technology Stack
### Frontend (`PIMS_FE`)
- **Framework**: React.js (built with Vite)
- **Environment**: Node.js
- **Features**: Responsive UI, Component-wise architecture, Google OAuth integration

### Backend (`PIMS_BE`)
- **Framework**: ASP.NET Core (C#)
- **Architecture**: Modular Layered Architecture
- **Database**: Microsoft SQL Server

### DevOps & Infrastructure
- Docker & Docker Compose
- Cloudflare Tunnel

## 📂 Project Structure
```text
📦 PIMS_Project
 ┣ 📂 PIMS_BE             # Backend API Application (.NET)
 ┣ 📂 PIMS_FE             # Frontend Application (React/Vite)
 ┣ 📂 diagrams            # Architectural & DB Models/Diagrams
 ┣ 📜 Schema.sql          # Database schema definitions and seed data
 ┣ 📜 docker-compose.yml  # Docker orchestration
 ┗ 📜 README.md
```

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed before proceeding:
- [Node.js](https://nodejs.org/) (for Frontend)
- [.NET SDK](https://dotnet.microsoft.com/download) (for Backend)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for containerization)
- [SQL Server Management Studio / Data Studio](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms) (optional, for DB management)

### Option 1: Running with Docker (Recommended)
You can spin up the entire application stack using the provided Docker configuration.

1. Open your terminal at the root directory of the project.
2. Build and start the containers using:
   ```bash
   docker-compose up -d --build
   ```
3. Access the services:
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:5172`

*(Note: Ensure that your `.env` or configuration variables like `TUNNEL_TOKEN` are set if utilizing the Cloudflare Tunnel).*

### Option 2: Local Development Setup

**1. Database Initialization**
- Open `Schema.sql` in your preferred SQL client and execute it against your local SQL Server instance to generate the `PIMS_Project` database.
- Update the Database `ConnectionString` in the Backend's `appsettings.Development.json` file to point to your local DB.

**2. Start the Backend Server**
```bash
cd PIMS_BE
dotnet restore
dotnet run
```

**3. Start the Frontend Client**
```bash
cd PIMS_FE/pims_fe.client
npm install
npm run dev
```

## 📜 License & Context
*Developed exclusively for the SWP391 Course Requirements.*
