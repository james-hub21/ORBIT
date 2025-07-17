# ORBIT - Integrated Library Facility & Computer Usage Management System

## Overview

ORBIT is a comprehensive library management system that combines two integrated subsystems:
1. **ORZ Computer Usage and Login System** - Manages computer workstation access and usage tracking
2. **Online Library Facility Booking System** - Handles facility reservations and resource management

The system serves three user roles (Student, Faculty, Admin) with role-based access controls and comprehensive session management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Radix UI with shadcn/ui components
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for development and build processes

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

### Authentication System
- **Provider**: Replit Auth integration
- **Session Storage**: PostgreSQL-backed session store
- **Role-based Access**: Three-tier system (Student/Faculty/Admin)
- **Security**: Two-factor authentication support, secure session cookies

## Key Components

### Database Schema
- **Users**: Profile management with role-based access
- **ORZ Sessions**: Computer usage tracking with time limits
- **Facility Bookings**: Resource reservation system
- **Time Extension Requests**: Admin-approval workflow
- **Computer Stations**: Workstation inventory management
- **Activity Logs**: Comprehensive audit trail

### Core Services
- **Session Service**: Handles ORZ computer session lifecycle with automatic inactivity logout
- **Email Service**: Automated notifications for bookings and approvals
- **Storage Service**: Centralized data access layer with type-safe operations

### Frontend Components
- **Dashboard Views**: Role-specific interfaces for students, faculty, and admins
- **Modal Systems**: Booking requests and time extension workflows
- **Real-time Updates**: Live session monitoring and status updates
- **Responsive Design**: Mobile-friendly interface with adaptive layouts

## Data Flow

### ORZ Computer Usage Flow
1. User authentication via Replit Auth
2. Station selection and session initiation
3. Real-time activity tracking with 10-minute inactivity timeout
4. Time extension requests with admin approval workflow
5. Automatic session termination and logging

### Facility Booking Flow
1. User browses available facilities and time slots
2. Booking request submission with purpose and participant details
3. Admin review and approval process
4. Email confirmation to user
5. Booking management and cancellation support

### Admin Management Flow
1. Dashboard overview of system usage and pending requests
2. User management with role assignment and status controls
3. Facility and computer station configuration
4. Report generation and analytics
5. System alerts and notification management

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI component primitives
- **express**: Web application framework
- **passport**: Authentication middleware

### Development Tools
- **typescript**: Type checking and compilation
- **vite**: Build tool and development server
- **tailwindcss**: Utility-first CSS framework
- **eslint**: Code linting and formatting

### Communication
- **nodemailer**: Email service for notifications
- **connect-pg-simple**: PostgreSQL session store
- **ws**: WebSocket support for real-time features

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations handle schema changes
- **Assets**: Static files served from build directory

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption key (required)
- **REPLIT_DOMAINS**: Authorized domains for auth (required)
- **SMTP_***: Email service configuration (optional)

### Development Workflow
- **Hot Reload**: Vite HMR for frontend changes
- **TypeScript**: Strict type checking across the stack
- **Database**: Push schema changes with `npm run db:push`
- **Testing**: Built-in error handling and logging

The system is designed as a monorepo with shared TypeScript types between frontend and backend, ensuring type safety across the entire application. The architecture supports both development and production environments with appropriate tooling and configuration management.