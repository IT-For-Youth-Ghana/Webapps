import "dotenv/config";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
import logger from "../src/utils/logger.js";
import models, { sequelize } from "../src/models/index.js";

const {
  User,
  Course,
  CourseModule,
  CourseTeacher,
  Enrollment,
  Payment,
  Notification,
  Admin,
  SystemSetting,
  StudentProgress,
} = models;

const SEED_RESET = process.env.SEED_RESET === "true";
const SEED_SYNC = process.env.SEED_SYNC === "true";

faker.seed(20260207);

//Generate course slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

async function seed() {
  logger.info("🌱 Seeding database...");
  await sequelize.authenticate();

  if (SEED_RESET) {
    logger.warn("⚠️  SEED_RESET=true -> dropping and recreating tables");
    await sequelize.sync({ force: true });
  } else if (SEED_SYNC) {
    logger.warn("⚠️  SEED_SYNC=true -> syncing tables with alter");
    await sequelize.sync({ alter: true });
  }

  const t = await sequelize.transaction();

  try {
    // Users
    const adminUser = await User.create(
      {
        email: "admin@itfy.test",
        passwordHash: "Password123!",
        firstName: "Admin",
        lastName: "User",
        role: "super_admin",
        emailVerified: true,
      },
      { transaction: t }
    );

    const teacherUser = await User.create(
      {
        email: "teacher@itfy.test",
        passwordHash: "Password123!",
        firstName: "Ama",
        lastName: "Boateng",
        role: "teacher",
        emailVerified: true,
      },
      { transaction: t }
    );

    const studentUser = await User.create(
      {
        email: "student@itfy.test",
        passwordHash: "Password123!",
        firstName: "Kojo",
        lastName: "Mensah",
        role: "student",
        emailVerified: true,
      },
      { transaction: t }
    );

    // Admin profile
    await Admin.create(
      {
        userId: adminUser.id,
        role: "super_admin",
        permissions: ["all"],
        lastLogin: new Date(),
      },
      { transaction: t }
    );


    // Courses
    const course = await Course.create(
      {
        title: "Full-Stack Web Development",
        shortDescription: "Build modern web apps from scratch.",
        description:
          "Learn HTML, CSS, JavaScript, Node.js, and databases with hands-on projects.",
        price: 499.0,
        slug: generateSlug("Full-Stack Web Development"),
        currency: "GHS",
        durationWeeks: 12,
        level: "beginner",
        category: "Web Development",
        thumbnailUrl: "https://picsum.photos/seed/itfy-course/800/450",
        status: "active",
      },
      { transaction: t }
    );

    const course2 = await Course.create(
      {
        title: "Data Analytics Fundamentals",
        shortDescription: "Analyze data and tell compelling stories.",
        description: "SQL, spreadsheets, and visualization for beginners.",
        price: 0,
        currency: "GHS",
        slug: generateSlug("Data Analytics Fundamentals"),
        durationWeeks: 6,
        level: "beginner",
        category: "Data",
        thumbnailUrl: "https://picsum.photos/seed/itfy-data/800/450",
        status: "active",
      },
      { transaction: t }
    );

    // Teacher assignment
    await CourseTeacher.create(
      {
        courseId: course.id,
        teacherId: teacherUser.id,
        permissions: ["all"],
        assignedAt: new Date(),
      },
      { transaction: t }
    );

    // Course modules
    const module1 = await CourseModule.create(
      {
        courseId: course.id,
        title: "Getting Started",
        description: "Setup, tools, and fundamentals.",
        moduleType: "lesson",
        orderIndex: 1,
        isRequired: true,
      },
      { transaction: t }
    );

    const module2 = await CourseModule.create(
      {
        courseId: course.id,
        title: "Frontend Basics",
        description: "HTML, CSS, and responsive layouts.",
        moduleType: "lesson",
        orderIndex: 2,
        isRequired: true,
      },
      { transaction: t }
    );

    const module3 = await CourseModule.create(
      {
        courseId: course.id,
        title: "Backend Essentials",
        description: "APIs, databases, and authentication.",
        moduleType: "lesson",
        orderIndex: 3,
        isRequired: true,
      },
      { transaction: t }
    );

    // Enrollment + payment
    const enrollment = await Enrollment.create(
      {
        userId: studentUser.id,
        courseId: course.id,
        enrollmentStatus: "enrolled",
        paymentStatus: "completed",
        progressPercentage: 15,
        enrolledAt: new Date(),
        lastAccessed: new Date(),
      },
      { transaction: t }
    );

    await Payment.create(
      {
        userId: studentUser.id,
        enrollmentId: enrollment.id,
        amount: course.price,
        currency: course.currency,
        paystackReference: `seed_${uuidv4()}`,
        status: "success",
        paymentMethod: "card",
        metadata: { seeded: true },
        paidAt: new Date(),
      },
      { transaction: t }
    );

    // Student progress
    await StudentProgress.bulkCreate(
      [
        {
          enrollmentId: enrollment.id,
          moduleId: module1.id,
          status: "completed",
          score: 95,
          startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 23),
        },
        {
          enrollmentId: enrollment.id,
          moduleId: module2.id,
          status: "in_progress",
          score: 40,
          startedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        },
        {
          enrollmentId: enrollment.id,
          moduleId: module3.id,
          status: "not_started",
        },
      ],
      { transaction: t }
    );

    // Notifications
    await Notification.create(
      {
        userId: studentUser.id,
        type: "course",
        title: "Welcome to Full-Stack Web Development",
        message: "Your enrollment is confirmed. Start with Module 1 today.",
        metadata: { courseId: course.id },
      },
      { transaction: t }
    );

    // System settings
    await SystemSetting.create(
      {
        key: "site_name",
        value: "IT For Youth Ghana Portal",
        description: "Public site title",
        isPublic: true,
        updatedBy: adminUser.id,
      },
      { transaction: t }
    );

    // Extra sample users (optional)
    const extraUsers = Array.from({ length: 3 }).map(() => ({
      email: faker.internet.email().toLowerCase(),
      passwordHash: "Password123!",
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: "student",
      emailVerified: faker.datatype.boolean(),
    }));

    await User.bulkCreate(extraUsers, {
      transaction: t,
      individualHooks: true,
    });

    await t.commit();
    logger.info("✅ Seed complete");
    logger.info("Test users:");
    logger.info("  admin@itfy.test / Password123!");
    logger.info("  teacher@itfy.test / Password123!");
    logger.info("  student@itfy.test / Password123!");
  } catch (error) {
    await t.rollback();
    logger.error("❌ Seed failed:", error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

seed().catch((error) => {
  logger.error("❌ Unhandled seeding error:", error);
  process.exit(1);
});
