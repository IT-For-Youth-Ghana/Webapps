/* eslint-disable no-undef */
/**
 * Database Seeder
 * Comprehensive seeding script for IT Youth Talent Incubator
 * 
 * Seeds:
 * - Admin users
 * - Student users with profiles
 * - Company users with profiles
 * - Jobs
 * - Applications
 * 
 * Usage:
 *   node seed.js --clear        // Clear all data
 *   node seed.js --seed         // Seed data
 *   node seed.js --refresh      // Clear and seed
 */

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import User from "../../modules/user/model/user.model.js";
import Student from "../../modules/user/model/student.model.js";
import Company from "../../modules/user/model/company.model.js";
import Admin from "../../modules/user/model/admin.model.js";
import Job from "../../modules/job/model/job.model.js";
import Application from "../../modules/application/model/application.model.js";
import dotenv from "dotenv";

dotenv.config();

// ========================================
// CONFIGURATION
// ========================================

const SEED_CONFIG = {
  ADMINS: 2,
  STUDENTS: 50,
  COMPANIES: 20,
  JOBS_PER_COMPANY: 3,
  APPLICATIONS_PER_STUDENT: 5,
};

// ========================================
// DATA TEMPLATES
// ========================================

const GHANA_CITIES = [
  "Accra",
  "Kumasi",
  "Tamale",
  "Takoradi",
  "Cape Coast",
  "Tema",
  "Koforidua",
  "Ho",
  "Sunyani",
  "Wa",
];

const TECH_SKILLS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C#",
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Express.js",
  "Django",
  "Flask",
  "Spring Boot",
  ".NET Core",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Git",
  "CI/CD",
  "REST API",
  "GraphQL",
  "HTML5",
  "CSS3",
  "Tailwind CSS",
  "Bootstrap",
  "Material UI",
  "Jest",
  "Cypress",
  "Selenium",
  "Agile/Scrum",
  "Microservices",
  "System Design",
  "Data Structures",
  "Algorithms",
];

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "Telecommunications",
  "Media",
  "Consulting",
  "Manufacturing",
  "Retail",
];

const JOB_TITLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "Data Scientist",
  "UI/UX Designer",
  "Product Manager",
  "QA Engineer",
  "Software Architect",
  "Security Engineer",
  "Machine Learning Engineer",
  "Cloud Engineer",
  "Database Administrator",
  "Technical Writer",
];

const UNIVERSITIES = [
  "University of Ghana",
  "Kwame Nkrumah University of Science and Technology",
  "University of Cape Coast",
  "Ashesi University",
  "Ghana Institute of Management and Public Administration",
  "University for Development Studies",
  "Ho Technical University",
  "Accra Technical University",
];

const DEGREES = [
  "Bachelor of Science",
  "Bachelor of Arts",
  "Master of Science",
  "Bachelor of Technology",
];

const FIELDS_OF_STUDY = [
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Data Science",
  "Cybersecurity",
  "Computer Engineering",
  "Business Administration",
  "Management Information Systems",
];

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Generate random subset of array
 */
function randomSubset(array, min = 1, max = 5) {
  const count = faker.number.int({ min, max: Math.min(max, array.length) });
  return faker.helpers.arrayElements(array, count);
}

/**
 * Generate password hash
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * Generate random date within range
 */
function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// ========================================
// DATA GENERATORS
// ========================================

/**
 * Generate admin data
 */
function generateAdmin(index) {
  const permissions = index === 0 
    ? ["super"] 
    : ["create", "read", "update", "delete"];

  return {
    user: {
      email: index === 0 ? "admin@incubator.com" : `admin${index}@incubator.com`,
      password_hash: "Admin@123",
      role: "admin",
      status: "approved",
      is_active: true,
      email_verified: true,
      email_verified_at: new Date(),
    },
    profile: {
      name: index === 0 ? "Super Admin" : faker.person.fullName(),
      permissions,
      title: index === 0 ? "Super Administrator" : "Administrator",
    },
  };
}

/**
 * Generate student data
 */
function generateStudent(index) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@student.com`;

  // Generate 1-2 education entries
  const educationCount = faker.number.int({ min: 1, max: 2 });
  const education = [];
  
  for (let i = 0; i < educationCount; i++) {
    const startDate = randomDate(new Date(2018, 0, 1), new Date(2021, 0, 1));
    const isCurrent = i === 0 && faker.datatype.boolean(0.3);
    
    education.push({
      school: faker.helpers.arrayElement(UNIVERSITIES),
      qualification: faker.helpers.arrayElement(DEGREES),
      field_of_study: faker.helpers.arrayElement(FIELDS_OF_STUDY),
      start_date: startDate,
      end_date: isCurrent ? null : randomDate(startDate, new Date()),
      is_current: isCurrent,
    });
  }

  // Generate 0-2 work experience entries
  const experienceCount = faker.number.int({ min: 0, max: 2 });
  const work_experience = [];
  
  for (let i = 0; i < experienceCount; i++) {
    const startDate = randomDate(new Date(2020, 0, 1), new Date(2023, 0, 1));
    const isCurrent = i === 0 && faker.datatype.boolean(0.4);
    
    work_experience.push({
      title: faker.helpers.arrayElement([
        "Junior Developer",
        "Software Developer Intern",
        "Frontend Developer",
        "Backend Developer",
        "IT Support Specialist",
      ]),
      company: faker.company.name(),
      location: faker.helpers.arrayElement(GHANA_CITIES),
      start_date: startDate,
      end_date: isCurrent ? null : randomDate(startDate, new Date()),
      is_current: isCurrent,
      description: faker.lorem.sentences(2),
    });
  }

  return {
    user: {
      email,
      password_hash: "Student@123",
      role: "student",
      status: "approved",
      is_active: true,
      email_verified: true,
      email_verified_at: new Date(),
      photo_url: faker.image.avatar(),
    },
    profile: {
      first_name: firstName,
      last_name: lastName,
      bio: faker.lorem.paragraph(),
      social_links: [
        {
          name: "LinkedIn",
          url: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        },
        {
          name: "GitHub",
          url: `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        },
      ],
      cv_url: `/uploads/resumes/cv-${firstName.toLowerCase()}-${lastName.toLowerCase()}.pdf`,
      skills: randomSubset(TECH_SKILLS, 5, 12),
      education,
      work_experience,
      status: faker.helpers.arrayElement(["active", "job_seeking", "inactive"]),
    },
  };
}

/**
 * Generate company data
 */
function generateCompany(index) {
  const companyName = faker.company.name();
  const email = `contact@${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}${index}.com`;

  return {
    user: {
      email,
      password_hash: "Company@123",
      role: "company",
      status: "approved",
      is_active: true,
      email_verified: true,
      email_verified_at: new Date(),
      photo_url: faker.image.url(),
    },
    profile: {
      name: companyName,
      description: faker.company.catchPhrase() + ". " + faker.lorem.paragraph(),
      industry: faker.helpers.arrayElement(INDUSTRIES),
      website: `https://www.${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      social_links: [
        {
          name: "LinkedIn",
          url: `https://linkedin.com/company/${companyName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        },
        {
          name: "Twitter",
          url: `https://twitter.com/${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        },
      ],
    },
  };
}

/**
 * Generate job data
 */
function generateJob(companyId) {
  const title = faker.helpers.arrayElement(JOB_TITLES);
  const jobType = faker.helpers.arrayElement([
    "full-time",
    "part-time",
    "internship",
    "contract",
    "remote",
  ]);
  
  const postedDate = randomDate(new Date(2024, 0, 1), new Date());
  const closingDate = faker.datatype.boolean(0.7)
    ? randomDate(new Date(), new Date(Date.now() + 60 * 24 * 60 * 60 * 1000))
    : null;

  const minSalary = faker.number.int({ min: 2000, max: 8000 });
  const maxSalary = minSalary + faker.number.int({ min: 2000, max: 5000 });

  return {
    company: companyId,
    title,
    description: faker.lorem.paragraphs(3),
    location: faker.helpers.arrayElement([
      ...GHANA_CITIES,
      "Remote",
      "Hybrid",
    ]),
    salary_range: {
      min: minSalary,
      max: maxSalary,
      currency: "GHS",
      display: `GHS ${minSalary.toLocaleString()} - ${maxSalary.toLocaleString()}`,
    },
    job_type: jobType,
    experience_level: faker.helpers.arrayElement([
      "entry",
      "junior",
      "mid",
      "senior",
    ]),
    skills: randomSubset(TECH_SKILLS, 5, 10),
    requirements: [
      faker.lorem.sentence(),
      faker.lorem.sentence(),
      faker.lorem.sentence(),
      faker.lorem.sentence(),
    ],
    benefits: [
      "Health Insurance",
      "Flexible Working Hours",
      "Professional Development",
      "Remote Work Option",
    ],
    status: faker.helpers.arrayElement(["open", "open", "open", "closed", "paused"]),
    posted_at: postedDate,
    closing_date: closingDate,
    is_featured: faker.datatype.boolean(0.2),
    view_count: faker.number.int({ min: 10, max: 500 }),
    application_count: 0, // Will be updated when applications are created
  };
}

/**
 * Generate application data
 */
function generateApplication(studentId, jobId) {
  const appliedDate = randomDate(new Date(2024, 0, 1), new Date());
  const status = faker.helpers.arrayElement([
    "pending",
    "pending",
    "reviewing",
    "shortlisted",
    "interviewed",
    "accepted",
    "rejected",
  ]);

  const reviewedAt = ["reviewing", "shortlisted", "interviewed", "accepted", "rejected"].includes(status)
    ? randomDate(appliedDate, new Date())
    : null;

  return {
    student: studentId,
    job: jobId,
    cover_letter: faker.lorem.paragraphs(2),
    resume_url: `/uploads/resumes/resume-${Date.now()}.pdf`,
    status,
    applied_date: appliedDate,
    reviewed_at: reviewedAt,
    company_notes: status !== "pending" ? faker.lorem.sentence() : undefined,
    rating: ["shortlisted", "interviewed", "accepted"].includes(status)
      ? faker.number.int({ min: 3, max: 5 })
      : undefined,
    rejection_reason: status === "rejected" ? faker.lorem.sentence() : undefined,
  };
}

// ========================================
// SEEDING FUNCTIONS
// ========================================

/**
 * Clear all data from database
 */
async function clearDatabase() {
  console.log("🗑️  Clearing database...");
  
  await Application.deleteMany({});
  await Job.deleteMany({});
  await Student.deleteMany({});
  await Company.deleteMany({});
  await Admin.deleteMany({});
  await User.deleteMany({});
  
  console.log("✅ Database cleared");
}

/**
 * Seed admin users
 */
async function seedAdmins() {
  console.log(`\n👤 Seeding ${SEED_CONFIG.ADMINS} admins...`);
  
  const admins = [];
  
  for (let i = 0; i < SEED_CONFIG.ADMINS; i++) {
    const adminData = generateAdmin(i);
    
    // Hash password
    adminData.user.password_hash = await hashPassword(adminData.user.password_hash);
    
    // Create user
    const user = await User.create(adminData.user);
    
    // Create admin profile
    const admin = await Admin.create({
      user: user._id,
      ...adminData.profile,
    });
    
    admins.push({ user, admin });
    console.log(`  ✓ Created admin: ${adminData.user.email}`);
  }
  
  return admins;
}

/**
 * Seed student users
 */
async function seedStudents() {
  console.log(`\n🎓 Seeding ${SEED_CONFIG.STUDENTS} students...`);
  
  const students = [];
  
  for (let i = 0; i < SEED_CONFIG.STUDENTS; i++) {
    const studentData = generateStudent(i);
    
    // Hash password
    studentData.user.password_hash = await hashPassword(studentData.user.password_hash);
    
    // Create user
    const user = await User.create(studentData.user);
    
    // Create student profile
    const student = await Student.create({
      user: user._id,
      ...studentData.profile,
    });
    
    students.push({ user, student });
    
    if ((i + 1) % 10 === 0) {
      console.log(`  ✓ Created ${i + 1}/${SEED_CONFIG.STUDENTS} students`);
    }
  }
  
  console.log(`  ✓ All ${SEED_CONFIG.STUDENTS} students created`);
  return students;
}

/**
 * Seed company users
 */
async function seedCompanies() {
  console.log(`\n🏢 Seeding ${SEED_CONFIG.COMPANIES} companies...`);
  
  const companies = [];
  
  for (let i = 0; i < SEED_CONFIG.COMPANIES; i++) {
    const companyData = generateCompany(i);
    
    // Hash password
    companyData.user.password_hash = await hashPassword(companyData.user.password_hash);
    
    // Create user
    const user = await User.create(companyData.user);
    
    // Create company profile
    const company = await Company.create({
      user: user._id,
      ...companyData.profile,
    });
    
    companies.push({ user, company });
    console.log(`  ✓ Created company: ${companyData.profile.name}`);
  }
  
  return companies;
}

/**
 * Seed jobs
 */
async function seedJobs(companies) {
  console.log(`\n💼 Seeding jobs (${SEED_CONFIG.JOBS_PER_COMPANY} per company)...`);
  
  const jobs = [];
  
  for (const { company } of companies) {
    for (let i = 0; i < SEED_CONFIG.JOBS_PER_COMPANY; i++) {
      const jobData = generateJob(company._id);
      const job = await Job.create(jobData);
      jobs.push(job);
    }
  }
  
  console.log(`  ✓ Created ${jobs.length} jobs`);
  return jobs;
}

/**
 * Seed applications
 */
async function seedApplications(students, jobs) {
  console.log(`\n📝 Seeding applications (max ${SEED_CONFIG.APPLICATIONS_PER_STUDENT} per student)...`);
  
  const applications = [];
  const jobApplicationCounts = new Map();
  
  for (const { student } of students) {
    // Random number of applications per student
    const applicationCount = faker.number.int({
      min: 0,
      max: SEED_CONFIG.APPLICATIONS_PER_STUDENT,
    });
    
    // Get random jobs (without duplicates)
    const selectedJobs = faker.helpers.arrayElements(jobs, applicationCount);
    
    for (const job of selectedJobs) {
      const applicationData = generateApplication(student._id, job._id);
      const application = await Application.create(applicationData);
      applications.push(application);
      
      // Track application count per job
      jobApplicationCounts.set(
        job._id.toString(),
        (jobApplicationCounts.get(job._id.toString()) || 0) + 1
      );
    }
  }
  
  // Update job application counts
  console.log("  ⚙️  Updating job application counts...");
  for (const [jobId, count] of jobApplicationCounts.entries()) {
    await Job.findByIdAndUpdate(jobId, { application_count: count });
  }
  
  console.log(`  ✓ Created ${applications.length} applications`);
  return applications;
}

// ========================================
// MAIN SEEDER
// ========================================

/**
 * Main seeding function
 */
async function seed() {
  try {
    console.log("🌱 Starting database seeding...\n");
    console.log("=" .repeat(50));
    
    const startTime = Date.now();
    
    // Seed in order (dependencies)
    const admins = await seedAdmins();
    const students = await seedStudents();
    const companies = await seedCompanies();
    const jobs = await seedJobs(companies);
    const applications = await seedApplications(students, jobs);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log("\n" + "=".repeat(50));
    console.log("✨ Seeding completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`  • Admins: ${admins.length}`);
    console.log(`  • Students: ${students.length}`);
    console.log(`  • Companies: ${companies.length}`);
    console.log(`  • Jobs: ${jobs.length}`);
    console.log(`  • Applications: ${applications.length}`);
    console.log(`\n⏱️  Time taken: ${duration}s`);
    
    console.log("\n🔑 Default Credentials:");
    console.log("  Super Admin:");
    console.log("    Email: admin@incubator.com");
    console.log("    Password: Admin@123");
    console.log("  \n  Students:");
    console.log("    Email: [firstname].[lastname][N]@student.com");
    console.log("    Password: Student@123");
    console.log("  \n  Companies:");
    console.log("    Email: contact@[companyname][N].com");
    console.log("    Password: Company@123");
    
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    throw error;
  }
}

// ========================================
// CLI INTERFACE
// ========================================

/**
 * Connect to database
 */
async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/incubator";
  
  try {
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

/**
 * Disconnect from database
 */
async function disconnectDB() {
  await mongoose.disconnect();
  console.log("\n✅ Disconnected from MongoDB");
}

/**
 * Main CLI handler
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  await connectDB();
  
  try {
    switch (command) {
      case "--clear":
        await clearDatabase();
        break;
        
      case "--seed":
        await seed();
        break;
        
      case "--refresh":
        await clearDatabase();
        await seed();
        break;
        
      default:
        console.log("📋 Usage:");
        console.log("  node seed.js --clear      Clear all data");
        console.log("  node seed.js --seed       Seed data");
        console.log("  node seed.js --refresh    Clear and seed");
        break;
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { seed, clearDatabase, connectDB, disconnectDB };