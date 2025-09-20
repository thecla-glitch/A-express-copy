# A-Express Task Management System

This is a full-stack task management application designed for workshops and service-oriented businesses. It helps manage tasks, customers, and users with different roles and permissions.

## Overview

The application consists of a Next.js frontend and a Django backend. It provides a comprehensive dashboard for different user roles, including Admin, Manager, Front-desk, and Technician.

## Features

- **Role-based access control:** Different user roles (Admin, Manager, Front-desk, Technician) with specific permissions.
- **Task Management:** Create, assign, and track tasks through different stages (unassigned, in-progress, QC, completed).
- **Customer Management:** Keep track of customer information and their associated tasks.
- **Dashboard:** A comprehensive overview of the system for different user roles.
- **Real-time Updates:** Real-time notifications and updates using websockets.
- **Reporting:** Generate reports on tasks, revenue, and technician workload.
- **Settings:** Configure application settings and manage users.

## Tech Stack

### Frontend

- [Next.js](https://nextjs.org/) - React framework for server-side rendering and static site generation.
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript.
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
- [Shadcn/ui](https://ui.shadcn.com/) - Re-usable components built using Radix UI and Tailwind CSS.

### Backend

- [Django](https://www.djangoproject.com/) - A high-level Python web framework.
- [Django REST Framework](https://www.django-rest-framework.org/) - A powerful and flexible toolkit for building Web APIs.
- [PostgreSQL](https://www.postgresql.org/) - A powerful, open source object-relational database system.

## Getting Started

### Prerequisites

- Node.js and pnpm
- Python and pip
- PostgreSQL

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/A-express-copy.git
   ```
2. **Frontend Setup:**
   ```bash
   cd A-express-copy
   pnpm install
   ```
3. **Backend Setup:**
   ```bash
   cd django_backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows use `.venv\Scripts\activate`
   pip install -r requirements.txt
   ```
4. **Database Setup:**
   - Create a PostgreSQL database.
   - Copy `.env.example` to `.env` and update the database credentials.
   - Run migrations:
     ```bash
     python manage.py migrate
     ```

### Running the application

1. **Start the backend server:**
   ```bash
   python manage.py runserver
   ```
2. **Start the frontend development server:**
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`.

## User Roles

- **Admin:** Has full access to the system, including user management, settings, and system logs.
- **Manager:** Can manage tasks, users, and view reports.
- **Front-desk:** Can create tasks, manage customers, and handle customer communication.
- **Technician:** Can view and update their assigned tasks.

## Project Structure

The project is organized into a Next.js frontend and a Django backend.

- `app/`: Contains the Next.js pages and layouts.
- `components/`: Contains the React components.
- `lib/`: Contains the API client, authentication context, and other utility functions.
- `django_backend/`: Contains the Django project.
- `Eapp/`: Contains the Django app with models, views, and serializers.