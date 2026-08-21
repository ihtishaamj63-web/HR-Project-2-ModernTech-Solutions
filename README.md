# ModernTech Solutions - HR Management System

## 📋 Overview

Following the successful prototype phase, ModernTech Solutions has approved the second phase of the project to build a robust, database-driven back-end infrastructure. This repository contains the complete full-stack HR Management System, transforming the initial front-end prototype into a production-ready application.

The system centralizes human resource management, replacing disconnected spreadsheets and documents with a secure, scalable platform for managing employees, tracking attendance, processing payroll, handling leave requests, and storing performance reviews.

---

## 🚀 Live Demo

| Component | Link |
|-----------|------|
| **Frontend Application** | [https://hr-project-2-moderntech-solutions-1.onrender.com/ |
| **Backend API** | [https://hr-project-2-moderntech-solutions.onrender.com/] |
| **Documentation** | [https://docs.google.com/document/d/18W5yCOUqC3uRyfejpW7TIqSX5TopzjkaIAcCNtLxmaA/edit?usp=sharing] |

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| HR Staff | `hr@moderntech.com` | `password123` |
| Employee | `sibongile.nkosi@moderntech.com` | `password123` |

---

## 🛠️ Tech Stack

### Frontend
- **Vue 3** (Composition API)
- **Vite** (Build Tool)
- **Bootstrap 5** & Bootstrap Icons
- **Axios** (HTTP Client)

### Backend
- **Node.js** & **Express.js**
- **JWT** (JSON Web Tokens) for Authentication
- **Bcryptjs** for Password Hashing
- **Express Rate Limit** for API Security

### Database & Hosting
- **MySQL** (Normalized to 3NF)
- **Render** (Backend Hosting)
- **Vercel / Render** (Frontend Hosting)
- **Aiven** (Cloud MySQL Database)

---

## ✨ Key Features

- **Role-Based Access Control** – Strict separation between HR staff and regular employees. Employees can only view their own data, while HR has global access.
- **Secure Authentication** – JWT-based login with bcrypt password hashing and rate limiting on auth routes.
- **Dashboard & Analytics** – Dynamic dashboard displaying total employees, pending requests, payroll summaries, and weekly attendance charts.
- **Employee Management** – Centralized directory with smart forms (dynamic department/position/salary selection), strict client/server-side validation, and secure CRUD operations.
- **Payroll Processing** – Automated calculations (Tax, UIF, Medical Aid, Pension) with digital payslip generation and PDF export capabilities.
- **Time-Off Management** – Comprehensive leave workflow (Submit, Approve, Deny, Cancel, Reverse) with automated auto-deny for past dates.
- **Attendance Tracking** – Visual 14-day attendance charts, daily roster, and a pop-up calendar modal for viewing historical employee attendance.
- **Performance Reviews** – Centralized review database with strict input validation (min character limits) and PDF report generation.
- **Dark Mode** – Fully responsive design with a persistent dark mode toggle across all pages.

---

## 🗄️ Database Schema & ERD

The database is fully normalized to the Third Normal Form (3NF) to ensure data integrity and eliminate redundancy.

### Entity Relationship Diagram (ERD)


For detailed database schema documentation, refer to the [Technical Documentation](#-documentation).

---

## 📚 Documentation

For comprehensive guides on API endpoints, database structure, deployment, and development workflows, please refer to our [https://docs.google.com/document/d/18W5yCOUqC3uRyfejpW7TIqSX5TopzjkaIAcCNtLxmaA/edit?usp=sharing](link-to-documentation).

---

## 👥 Team Roles & Responsibilities

### Ihtishaam Johnson - Tech Lead & Full-Stack Developer
- Acted as Team Lead (TL), managing the integration branch, reviewing team code, and correcting/refactoring code across all modules to ensure MVC architecture and code quality.
- Built the core backend infrastructure (Server setup, Database config, Middleware, Auth system).
- Developed the Attendance tracking system (14-day charts, calendar modal, strict time logging).
- Developed the Time-Off management system (Approval workflows, auto-cleanup).
- Implemented global UI features (Dark mode, Navbar, Axios interceptors, Toast notifications).
- Managed cloud deployment (Render & Aiven Database setup).

### Zahraa Moerat - Full-Stack Developer
- Developed the Employee Management module (Frontend & Backend).
- Built the "Add Employee" workflow with dynamic dropdowns (Department → Position → Salary Tier).
- Implemented strict form validation (Name, Email, Phone, Future dates).
- Contributed to the shared UI styling and responsive design.

### Owam Gobinca - Full-Stack Developer
- Developed the Dashboard analytics page and integrated live API data.
- Developed the Performance Reviews module (Frontend & Backend).
- Implemented PDF generation for review reports and dynamic star ratings.
- Assisted with backend controller and model logic for reviews.

### Migcobo Macilikishe - Full-Stack Developer
- Developed the Payroll management system (Frontend & Backend).
- Implemented automated tax/deduction calculations and payroll models.
- Built the digital payslip modal and Excel/CSV export functionality.
- Contributed to role-based data filtering for employee privacy.

---

## ⚙️ Local Setup & Installation

To run this project locally, ensure you have **Node.js** and **MySQL** installed.

### 1. Database Setup

1. Open your MySQL client (e.g., MySQL Workbench).
2. Run the script located at `database/schema.sql` to create the database, tables, and seed data.

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ModernTech_Solutions
JWT_SECRET=modernTechSecretKey2026
PORT=3000
```

Start the backend server:

```bash
npm start
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend-vue
npm install
```

Start the Vue development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

**Last Updated:** 21 August 2026  
**Version:** 2.0 (Production Release)
