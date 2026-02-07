# IT For Youth Ghana - Architecture Documentation

## 📋 Overview

This directory contains comprehensive PlantUML diagrams documenting the complete architecture for the IT For Youth Ghana educational platform MVP.

## 📁 Diagram Files

### 1. **architecture.puml**
**Main System Architecture**
- Complete system overview showing all components
- Frontend layer (Main Site, Student Portal, Moodle, Incubator)
- Backend layer (Central API, Telegram Bot)
- Database layer (PostgreSQL, MongoDB, Moodle DB)
- External services (Paystack, Email, Telegram API)
- Data flow annotations

### 2. **sequence_diagrams.puml**
**Key User Flows**
- Student registration & enrollment flow
- SSO authentication flow (Moodle & Incubator)
- Telegram bot teacher management
- Course completion webhook
- Telegram bot export functionality
- Payment webhook security validation

### 3. **deployment_diagrams.puml**
**Infrastructure & Deployment**
- Cloud infrastructure setup
- Environment configuration
- DNS configuration
- Scaling strategy (MVP → Production)
- Backup & disaster recovery
- Monitoring & logging architecture

### 4. **database_diagrams.puml**
**Database Schema**
- PostgreSQL central database (complete ERD)
- MongoDB incubator collections
- Database views and materialized views
- Database triggers and functions
- Indexes and relationships

### 5. **api_documentation.puml**
**API Endpoints**
- Authentication endpoints
- Student endpoints
- Course endpoints
- Payment endpoints
- SSO endpoints
- Admin endpoints
- Webhook endpoints
- Moodle API integration
- Error response formats
- Rate limiting strategy

## 🔧 How to View the Diagrams

### Option 1: Online PlantUML Editor (Easiest)
1. Go to [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
2. Copy the content from any `.puml` file
3. Paste into the editor
4. View the rendered diagram

### Option 2: VS Code (Recommended for Development)
1. Install the PlantUML extension:
   ```
   ext install jebbs.plantuml
   ```
2. Install Graphviz:
   ```bash
   # macOS
   brew install graphviz
   
   # Ubuntu/Debian
   sudo apt-get install graphviz
   
   # Windows
   choco install graphviz
   ```
3. Open any `.puml` file in VS Code
4. Press `Alt + D` to preview the diagram

### Option 3: Generate PNG/SVG Files
Using PlantUML command line:
```bash
# Install PlantUML
brew install plantuml  # macOS
# or download from https://plantuml.com/download

# Generate all diagrams as PNG
plantuml -tpng *.puml

# Generate as SVG (better for documentation)
plantuml -tsvg *.puml

# Generate as PDF
plantuml -tpdf *.puml
```

### Option 4: Docker (No Local Installation)
```bash
# Run PlantUML server locally
docker run -d -p 8080:8080 plantuml/plantuml-server:jetty

# Open http://localhost:8080 in browser
# Upload or paste diagram code
```

## 📊 Diagram Descriptions

### Architecture Diagram
Shows the complete system architecture including:
- User interactions (Students, Teachers, Admins)
- Three frontend applications (Main Site, Portal, Moodle, Incubator)
- Central API backend with all services
- Database layer with PostgreSQL, MongoDB, and Moodle DB
- External integrations (Paystack, Email, Telegram)
- SSO flow between systems

### Sequence Diagrams
Detailed step-by-step flows:
1. **Registration Flow**: From email entry to successful enrollment
2. **SSO Flow**: How students access Moodle/Incubator without re-login
3. **Teacher Management**: How admins add teachers via Telegram
4. **Course Completion**: How Moodle notifies the central system
5. **Export Flow**: How admins export data via Telegram bot

### Deployment Diagrams
Infrastructure setup:
- Hosting recommendations (Vercel, Railway, VPS)
- Environment variables configuration
- DNS setup for subdomains
- Scaling strategy from MVP to production
- Backup and monitoring strategy

### Database Diagrams
Complete data model:
- 13+ tables with relationships
- MongoDB collections for Incubator
- Database views for reporting
- Triggers for automation
- Indexes for performance

### API Documentation
All API endpoints with:
- Request/response formats
- Authentication requirements
- Query parameters
- Error responses
- Rate limiting rules

## 🎯 Key Architectural Decisions

### 1. **Federated Identity**
- PostgreSQL as single source of truth for auth
- SSO tokens for seamless cross-system access
- Lazy sync to Incubator (create on first login)

### 2. **Two-Way Moodle Sync**
- Courses created in Moodle (LMS expertise)
- Synced to central DB for student portal display
- Webhooks for real-time updates

### 3. **Telegram Bot for Admin**
- Quick MVP admin interface
- No custom admin panel needed
- Excel exports, stats, teacher management

### 4. **Payment Flow**
- Paystack webhook-based (not redirect)
- Enrollment only after payment success
- Automatic Moodle user creation & enrollment

## 🚀 Implementation Timeline

Based on the diagrams, here's the suggested timeline:

**Day 1-2**: Database & Backend API
- Set up PostgreSQL database
- Create all tables with migrations
- Build auth endpoints (register/login)

**Day 3**: Payment & Moodle Integration
- Paystack integration
- Moodle API setup
- User creation & enrollment

**Day 4**: Student Portal
- Next.js setup
- Registration flow
- Student dashboard

**Day 5**: SSO & Incubator
- SSO token generation
- Incubator modifications
- Cross-system authentication

**Day 6**: Telegram Bot
- Bot commands setup
- Admin authentication
- Stats and export features

**Day 7**: Testing & Deployment
- End-to-end testing
- Deploy all services
- DNS configuration

## 📝 Environment Variables Checklist

Use the environment configuration diagram to set up:

### Central API
- [ ] DATABASE_URL
- [ ] MOODLE_URL
- [ ] MOODLE_TOKEN
- [ ] INCUBATOR_URL
- [ ] PAYSTACK_SECRET_KEY
- [ ] SSO_SECRET
- [ ] JWT_SECRET
- [ ] EMAIL_SERVICE_KEY
- [ ] TELEGRAM_BOT_TOKEN

### Student Portal
- [ ] NEXT_PUBLIC_API_URL
- [ ] NEXT_PUBLIC_PAYSTACK_KEY
- [ ] SESSION_SECRET

### Incubator
- [ ] MONGODB_URI
- [ ] SSO_SECRET (must match Central API)
- [ ] JWT_SECRET
- [ ] CENTRAL_API_URL

### Telegram Bot
- [ ] BOT_TOKEN
- [ ] CENTRAL_API_URL
- [ ] ADMIN_CHAT_IDS

## 🔐 Security Notes

From the diagrams:
1. **Webhook Signature Validation**: Always verify Paystack HMAC signatures
2. **SSO Token Expiry**: 5 minutes for SSO tokens (short-lived)
3. **Rate Limiting**: Implement using Redis (see API documentation)
4. **HTTPS Only**: All production endpoints must use HTTPS
5. **Environment Secrets**: Never commit `.env` files

## 📚 Additional Resources

- [Moodle Web Services Documentation](https://docs.moodle.org/dev/Web_services)
- [Paystack API Documentation](https://paystack.com/docs/api/)
- [Node Telegram Bot API](https://github.com/yagop/node-telegram-bot-api)
- [Next.js Documentation](https://nextjs.org/docs)
- [PlantUML Language Reference](https://plantuml.com/guide)

## 🤝 Contributing to Architecture

When updating diagrams:
1. Edit the `.puml` files
2. Generate new images
3. Update this README if adding new diagrams
4. Commit both source and generated images

## 📧 Questions?

If any part of the architecture is unclear:
1. Check the relevant diagram
2. Review the sequence flows
3. Refer to API documentation
4. Ask in the development channel

---

**Last Updated**: February 4, 2026
**Version**: 1.0.0 (MVP)
