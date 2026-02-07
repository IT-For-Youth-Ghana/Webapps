# Moodle Installation & Setup Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Moodle Configuration](#moodle-configuration)
3. [Web Services Setup (Critical for API)](#web-services-setup)
4. [Creating Courses](#creating-courses)
5. [Testing Integration](#testing-integration)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Option 1: Docker (Recommended for MVP - Fastest)

**Why Docker?** 
- ✅ Quick setup (5 minutes)
- ✅ No PHP/MySQL version conflicts
- ✅ Easy to reset/restart
- ✅ Matches production environment

#### Step 1: Install Docker
```bash
# macOS
brew install --cask docker

# Ubuntu
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Windows
# Download from https://www.docker.com/products/docker-desktop
```

#### Step 2: Create Moodle Docker Setup

Create a new directory for Moodle:
```bash
mkdir moodle-local
cd moodle-local
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  moodle:
    image: bitnami/moodle:4.3
    container_name: moodle-app
    ports:
      - "8080:8080"
      - "8443:8443"
    environment:
      # Database config
      - MOODLE_DATABASE_HOST=mariadb
      - MOODLE_DATABASE_PORT_NUMBER=3306
      - MOODLE_DATABASE_USER=bn_moodle
      - MOODLE_DATABASE_PASSWORD=bitnami
      - MOODLE_DATABASE_NAME=bitnami_moodle
      
      # Admin credentials
      - MOODLE_USERNAME=admin
      - MOODLE_PASSWORD=AdminPassword123!
      - MOODLE_EMAIL=admin@itforyouthghana.org
      
      # Site config
      - MOODLE_SITE_NAME=IT For Youth Ghana LMS
      - MOODLE_SKIP_BOOTSTRAP=no
      
    volumes:
      - moodle_data:/bitnami/moodle
      - moodledata_data:/bitnami/moodledata
    depends_on:
      - mariadb
    networks:
      - moodle-network

  mariadb:
    image: bitnami/mariadb:11.0
    container_name: moodle-db
    environment:
      - MARIADB_USER=bn_moodle
      - MARIADB_PASSWORD=bitnami
      - MARIADB_DATABASE=bitnami_moodle
      - MARIADB_ROOT_PASSWORD=rootpassword
      - MARIADB_CHARACTER_SET=utf8mb4
      - MARIADB_COLLATE=utf8mb4_unicode_ci
    volumes:
      - mariadb_data:/bitnami/mariadb
    networks:
      - moodle-network

volumes:
  moodle_data:
  moodledata_data:
  mariadb_data:

networks:
  moodle-network:
    driver: bridge
```

#### Step 3: Start Moodle
```bash
# Start containers
docker-compose up -d

# Check logs
docker-compose logs -f moodle

# Wait 2-3 minutes for initial setup
```

#### Step 4: Access Moodle
```
URL: http://localhost:8080
Username: admin
Password: AdminPassword123!
```

**First Login:**
1. Go to http://localhost:8080
2. Login with admin credentials
3. Complete initial setup wizard
4. Set site timezone (Africa/Accra for Ghana)

---

### Option 2: Manual Installation (More Control)

Only use if you need full control or Docker isn't available.

#### Requirements:
- PHP 8.1+ with extensions: mysqli, gd, curl, zip, mbstring, xml, json, intl
- MySQL 8.0+ or PostgreSQL 13+
- Apache/Nginx web server

#### Step 1: Download Moodle
```bash
cd ~/Sites  # or your web root
git clone -b MOODLE_403_STABLE git://git.moodle.org/moodle.git moodle
cd moodle
```

#### Step 2: Create Database
```bash
mysql -u root -p

CREATE DATABASE moodle DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'moodleuser'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON moodle.* TO 'moodleuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Step 3: Create Data Directory
```bash
sudo mkdir /var/moodledata
sudo chown www-data:www-data /var/moodledata
sudo chmod 0777 /var/moodledata
```

#### Step 4: Configure Apache
```bash
sudo nano /etc/apache2/sites-available/moodle.conf
```

```apache
<VirtualHost *:8080>
    ServerName localhost
    DocumentRoot /path/to/moodle
    
    <Directory /path/to/moodle>
        Options FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/moodle-error.log
    CustomLog ${APACHE_LOG_DIR}/moodle-access.log combined
</VirtualHost>
```

```bash
sudo a2ensite moodle
sudo systemctl reload apache2
```

#### Step 5: Run Web Installer
1. Visit http://localhost:8080
2. Follow installation wizard
3. Enter database credentials
4. Set admin password

---

## Moodle Configuration

### 1. Site Administration Access

After login as admin:

**Navigation:**
```
Dashboard → Site administration
```

### 2. Enable Web Services (CRITICAL)

This is essential for your backend API to communicate with Moodle.

#### Enable Web Services
```
Site administration → Advanced features
✓ Enable web services
[Save changes]
```

#### Enable REST Protocol
```
Site administration → Server → Web services → Manage protocols
✓ Enable REST protocol
```

#### Create Web Service User

```
Site administration → Users → Accounts → Add a new user

Username: webservice_user
Password: SecurePassword123!
First name: Web Service
Last name: API User
Email: api@itforyouthghana.org

[Create user]
```

#### Create Web Service Role

```
Site administration → Users → Permissions → Define roles
[Add a new role]

Role name: Web Service
Short name: webservice
Context types: System

Capabilities to allow:
✓ webservice/rest:use
✓ moodle/webservice:createtoken
✓ moodle/user:create
✓ moodle/user:update
✓ moodle/course:view
✓ moodle/course:viewparticipants
✓ enrol/manual:enrol
✓ enrol/manual:unenrol
✓ moodle/grade:view
✓ moodle/grade:viewall

[Create this role]
```

#### Assign Role to Web Service User

```
Site administration → Users → Permissions → Assign system roles
→ Web Service role
→ Add user "Web Service API User"
```

#### Create Web Service

```
Site administration → Server → Web services → External services
[Add a new service]

Name: IT For Youth Ghana API
Short name: itfy_api
✓ Enabled

[Add service]

Click "Add functions"
Add these functions:
- core_user_create_users
- core_user_update_users
- core_user_get_users_by_field
- enrol_manual_enrol_users
- enrol_manual_unenrol_users
- core_course_get_courses
- core_course_create_courses
- core_completion_get_course_completion_status
- core_role_assign_roles

[Update]

Under "Authorised users":
→ Add user "Web Service API User"
```

#### Generate Token (IMPORTANT!)

```
Site administration → Server → Web services → Manage tokens
[Create token]

User: Web Service API User
Service: IT For Youth Ghana API

[Save changes]

Copy the TOKEN - you'll need this for your backend .env file!
Example: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

**Save this token immediately in your backend .env:**
```bash
MOODLE_TOKEN=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

---

## Creating Courses

### Method 1: Web Interface (For Testing)

```
Site administration → Courses → Manage courses and categories
[Create new course]

Course full name: Web Development Fundamentals
Course short name: WEB-DEV-101
Course category: IT Courses
Course start date: [Today]
Course end date: [+12 weeks]
Description: Learn HTML, CSS, JavaScript basics

[Save and display]
```

### Method 2: Via API (Automated)

Your backend can create courses via API. Test with this curl command:

```bash
curl -X POST "http://localhost:8080/webservice/rest/server.php" \
  -d "wstoken=YOUR_TOKEN_HERE" \
  -d "wsfunction=core_course_create_courses" \
  -d "moodlewsrestformat=json" \
  -d "courses[0][fullname]=Python Programming" \
  -d "courses[0][shortname]=PYTHON-101" \
  -d "courses[0][categoryid]=1" \
  -d "courses[0][summary]=Learn Python from scratch"
```

Response:
```json
[
  {
    "id": 2,
    "shortname": "PYTHON-101"
  }
]
```

**Save the course ID (2) - you'll need it!**

---

## Testing Integration

### 1. Test Token Works

```bash
curl "http://localhost:8080/webservice/rest/server.php?wstoken=YOUR_TOKEN&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json"
```

Expected response:
```json
{
  "sitename": "IT For Youth Ghana LMS",
  "username": "webservice_user",
  "userid": 2,
  "functions": [...]
}
```

### 2. Test Creating a User

```bash
curl -X POST "http://localhost:8080/webservice/rest/server.php" \
  -d "wstoken=YOUR_TOKEN" \
  -d "wsfunction=core_user_create_users" \
  -d "moodlewsrestformat=json" \
  -d "users[0][username]=testuser123" \
  -d "users[0][password]=TempPass123!" \
  -d "users[0][firstname]=Test" \
  -d "users[0][lastname]=User" \
  -d "users[0][email]=test@example.com"
```

Response:
```json
[
  {
    "id": 3,
    "username": "testuser123"
  }
]
```

### 3. Test Enrolling User in Course

```bash
curl -X POST "http://localhost:8080/webservice/rest/server.php" \
  -d "wstoken=YOUR_TOKEN" \
  -d "wsfunction=enrol_manual_enrol_users" \
  -d "moodlewsrestformat=json" \
  -d "enrolments[0][roleid]=5" \
  -d "enrolments[0][userid]=3" \
  -d "enrolments[0][courseid]=2"
```

**Role IDs:**
- 5 = Student
- 3 = Teacher
- 1 = Manager

### 4. Verify in Moodle UI

Go to:
```
Site administration → Users → Browse list of users
```

You should see "Test User" created.

Go to course → Participants - user should be enrolled.

---

## Backend Integration Code

### Update Your .env

```bash
# Moodle Configuration
MOODLE_URL=http://localhost:8080
MOODLE_TOKEN=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

### Test Your Backend Integration

```javascript
// Test file: test-moodle.js
const moodleService = require('./src/integrations/moodle/moodle.service');

async function test() {
  try {
    // Test 1: Create user
    console.log('Creating user...');
    const user = await moodleService.createUser({
      username: 'john_doe_456',
      password: 'TempPass123!',
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@example.com'
    });
    console.log('User created:', user);
    
    // Test 2: Get courses
    console.log('\nGetting courses...');
    const courses = await moodleService.getCourses();
    console.log('Courses:', courses);
    
    // Test 3: Enroll user
    if (courses.length > 0) {
      console.log('\nEnrolling user...');
      await moodleService.enrollUser(user.id, courses[0].id);
      console.log('User enrolled successfully');
    }
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

test();
```

Run test:
```bash
node test-moodle.js
```

---

## Production Deployment

### Option 1: VPS (DigitalOcean, Linode, AWS EC2)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y apache2 mysql-server php8.1 php8.1-{cli,mysql,gd,curl,zip,mbstring,xml,json,intl,soap,ldap}

# Enable Apache modules
sudo a2enmod rewrite ssl
```

#### 2. Install Moodle

```bash
cd /var/www
sudo git clone -b MOODLE_403_STABLE git://git.moodle.org/moodle.git
sudo mkdir /var/moodledata
sudo chown -R www-data:www-data /var/www/moodle /var/moodledata
sudo chmod -R 755 /var/www/moodle
sudo chmod -R 777 /var/moodledata
```

#### 3. Configure Database

```bash
sudo mysql

CREATE DATABASE moodle DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'moodleuser'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON moodle.* TO 'moodleuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 4. Configure Apache

```bash
sudo nano /etc/apache2/sites-available/moodle.conf
```

```apache
<VirtualHost *:80>
    ServerName lms.itforyouthghana.org
    DocumentRoot /var/www/moodle

    <Directory /var/www/moodle>
        Options FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/moodle-error.log
    CustomLog ${APACHE_LOG_DIR}/moodle-access.log combined
</VirtualHost>
```

```bash
sudo a2ensite moodle
sudo systemctl reload apache2
```

#### 5. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d lms.itforyouthghana.org
```

Certbot will automatically configure HTTPS.

#### 6. Complete Installation

Visit: https://lms.itforyouthghana.org
Follow installation wizard.

#### 7. Configure Cron

```bash
sudo crontab -u www-data -e
```

Add:
```
* * * * * /usr/bin/php /var/www/moodle/admin/cli/cron.php >/dev/null
```

---

### Option 2: Managed Moodle Hosting (Easiest for Production)

**Recommended Providers:**
- **Moodle Cloud** (official) - $100-500/month
- **Lambda Solutions** - Custom pricing
- **eThink Education** - $200+/month

**Pros:**
- ✅ No server management
- ✅ Automatic updates
- ✅ Backups included
- ✅ SSL included
- ✅ Support included

**Setup:**
1. Sign up for hosting
2. Point your domain (lms.itforyouthghana.org)
3. They handle installation
4. You configure web services (same as above)
5. Copy token to your backend

---

### Option 3: Docker in Production

```bash
# On your VPS
git clone <your-repo>
cd moodle-docker

# Update docker-compose.yml with production values
nano docker-compose.yml
```

Update environment variables:
```yaml
environment:
  - MOODLE_URL=https://lms.itforyouthghana.org
  - MOODLE_DATABASE_PASSWORD=STRONG_PASSWORD
  # etc.
```

```bash
docker-compose up -d

# Setup Nginx reverse proxy
sudo apt install nginx
```

Create `/etc/nginx/sites-available/moodle`:
```nginx
server {
    listen 80;
    server_name lms.itforyouthghana.org;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/moodle /etc/nginx/sites-enabled/
sudo systemctl reload nginx

# SSL
sudo certbot --nginx -d lms.itforyouthghana.org
```

---

## Post-Installation Configuration

### 1. Set Up Course Categories

```
Site administration → Courses → Manage courses and categories
[Add new category]

Categories:
- IT & Programming
- Digital Skills
- Business & Entrepreneurship
```

### 2. Configure Enrollment

```
Site administration → Plugins → Enrolments → Manage enrol plugins
✓ Enable "Manual enrolments"
✓ Disable "Self enrolment" (you'll control via API)
```

### 3. Set Completion Tracking

```
Site administration → Advanced features
✓ Enable completion tracking

For each course:
Course → Settings → Completion tracking
Completion tracking: Yes
```

### 4. Configure Roles

Make sure these roles exist:
- Student (ID: 5)
- Teacher (ID: 3)
- Manager (ID: 1)

### 5. Appearance Settings

```
Site administration → Appearance → Themes
Select theme: Boost (modern, responsive)

Upload logo: [Your IT For Youth Ghana logo]
Primary color: #2563eb (your brand color)
```

---

## Synchronization Strategy

### 1. Course Sync (Moodle → Your DB)

Run this daily via cron:

```javascript
// backend: src/services/sync.service.js
async syncCoursesFromMoodle() {
  const moodleCourses = await moodleService.getCourses();
  
  for (const course of moodleCourses) {
    await courseRepository.upsert({
      moodleCourseId: course.id,
      title: course.fullname,
      description: course.summary,
      // Keep your price/duration from DB
    });
  }
}
```

### 2. Completion Sync (Moodle → Your DB)

Set up Moodle webhook or poll daily:

```javascript
async syncCompletions() {
  const enrollments = await enrollmentRepository.findActive();
  
  for (const enrollment of enrollments) {
    const completion = await moodleService.getCourseCompletion(
      enrollment.course.moodle_course_id,
      enrollment.user.moodle_user_id
    );
    
    if (completion.completed) {
      await enrollmentService.markComplete(enrollment.id);
    }
  }
}
```

---

## Troubleshooting

### Issue: "Web service not available"

**Fix:**
```
Site administration → Advanced features
✓ Enable web services
```

### Issue: "Invalid token"

**Fix:**
Regenerate token:
```
Site administration → Server → Web services → Manage tokens
→ Delete old token
→ Create new token
→ Update .env file
```

### Issue: Can't create users

**Fix:**
Check role has permission:
```
Site administration → Users → Permissions → Define roles
→ Web Service role
✓ moodle/user:create
```

### Issue: Docker container won't start

**Fix:**
```bash
# Check logs
docker-compose logs moodle

# Reset
docker-compose down -v
docker-compose up -d
```

### Issue: Course enrollment fails

**Fix:**
Check course ID and role ID:
```bash
# List courses
curl "http://localhost:8080/webservice/rest/server.php?wstoken=TOKEN&wsfunction=core_course_get_courses&moodlewsrestformat=json"

# Verify role ID (should be 5 for student)
```

---

## Summary Checklist

### Local Setup
- [ ] Install Docker or LAMP stack
- [ ] Start Moodle (http://localhost:8080)
- [ ] Login as admin
- [ ] Enable web services
- [ ] Enable REST protocol
- [ ] Create web service user & role
- [ ] Create external service
- [ ] Generate token
- [ ] Add token to backend .env
- [ ] Test API connection
- [ ] Create test course
- [ ] Test user creation
- [ ] Test enrollment

### Production Setup
- [ ] Choose hosting (VPS vs Managed)
- [ ] Install Moodle
- [ ] Configure domain (lms.itforyouthghana.org)
- [ ] Setup SSL certificate
- [ ] Configure web services
- [ ] Generate production token
- [ ] Update backend production .env
- [ ] Test production API
- [ ] Set up cron jobs
- [ ] Configure backups

---

**Next:** Once Moodle is running and web services are configured, your backend will automatically handle:
- Creating users after payment
- Enrolling students in courses
- Tracking progress
- Syncing completions

**Questions?** Check the API documentation or test with curl commands above!
