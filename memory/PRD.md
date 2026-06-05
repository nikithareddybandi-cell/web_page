# TaxFile Pro - Product Requirements Document

## Original Problem Statement
Create a webpage for a tax filing company with pages to show company services and login option where users can create account and upload files and data. Two different portals: User portal and Admin portal.

## User Choices
- **Authentication**: JWT-based custom auth (email/password)
- **File Upload**: All common document formats (PDF, images, Excel, Word, CSV)
- **Admin Portal**: Full management (users, documents, status updates, analytics/reports)
- **Pages**: Home, About, Services, Contact
- **Design**: Professional corporate (trust-focused, traditional)

## Architecture
- **Backend**: FastAPI + MongoDB + JWT + bcrypt + Emergent Object Storage
- **Frontend**: React 19 + React Router + Shadcn UI + Tailwind CSS
- **Design**: Organic & Earthy theme (Deep Forest Green #123524, Terracotta #C86B53, Bone White #FDFBF7)
- **Typography**: Playfair Display (headings) + Manrope (body)

## User Personas
1. **Individual Taxpayer**: Uploads tax documents, tracks filing status
2. **Business Owner**: Uploads business tax documents
3. **Admin**: Manages users, reviews documents, updates filing status

## Core Requirements (Implemented)
- Public marketing pages (Home, About, Services, Contact)
- User registration & login with JWT cookies
- User dashboard with document upload (PDF, images, Excel, Word, CSV)
- Document download, delete, and status tracking
- Admin dashboard with statistics (users, documents, pending, completed)
- Admin can update document filing status
- Admin can view all users and documents
- Contact form submission
- Brute force protection on login
- Role-based access control (user/admin)

## Test Credentials
- Admin: admin@taxfile.com / Admin@123

## Status (2026-02-05)
✅ **MVP Complete** - All core features implemented and tested (100% backend, 100% frontend flows passed)

## Backlog (P1 - Next Phase)
- Email notifications for status updates
- Stripe payment integration for service fees
- Document preview without download
- Multi-file upload with drag-and-drop
- User profile editing
- Password reset email integration
- Document categories/tags

## Backlog (P2 - Future)
- Advanced analytics charts in admin
- Multi-language support
- Mobile app
- Tax calculator widget
- Live chat support
