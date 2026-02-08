/**
 * Course Service
 * Business logic for course management
 */

import Course from "./course.model.js";
import User from "../user/user.model.js";
import CourseTeacher from "./course-teacher.model.js";
import CourseModule from "./course-module.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import { Op } from "sequelize";
import { NotFoundError, ValidationError } from "../../utils/errors.js";
import logger from "../../utils/logger.js";
import moodleService from "../../integrations/moodle/moodle.service.js";

const normalizeSlug = (value) => {
    if (!value) return "";
    return value
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const isUuid = (value) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value
    );

class CourseService {
    async generateUniqueSlug(baseSlug, excludeId = null) {
        if (!baseSlug) {
            throw new ValidationError("Invalid course slug");
        }

        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const existing = await Course.findOne({
                where: {
                    slug,
                    ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
                },
            });

            if (!existing) {
                return slug;
            }

            slug = `${baseSlug}-${counter}`;
            counter += 1;
        }
    }

    /**
     * Get all courses with filters
     */
    async getAllCourses(filters = {}) {
        const {
            page = 1,
            limit = 10,
            category,
            level,
            search,
            status = "active"
        } = filters;

        // Build where clause
        const where = {};

        if (status) where.status = status;
        if (category) where.category = category;
        if (level) where.level = level;

        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
            ];
        }

        // Query courses
        const result = await Course.paginate({
            page,
            limit,
            where,
            order: [["title", "ASC"]],
        });

        return result;
    }

    /**
     * Get course by ID with details
     */
    async getCourseById(courseIdOrSlug) {
        const lookup = isUuid(courseIdOrSlug)
            ? { id: courseIdOrSlug }
            : { slug: courseIdOrSlug };

        const course = await Course.findOne({
            where: lookup,
            include: [
                {
                    model: User,
                    as: "teachers",
                    through: { attributes: [] }, // Exclude join table
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: CourseModule,
                    as: "modules",
                    order: [["orderIndex", "ASC"]],
                },
            ],
        });

        if (!course) {
            throw new NotFoundError("Course not found");
        }

        // Get enrollment count
        const enrollmentCount = await Enrollment.count({
            where: { courseId: course.id },
        });

        const courseData = course.toJSON();
        courseData.enrollmentCount = enrollmentCount;

        return courseData;
    }

    /**
     * Create course (Admin only)
     */
    async createCourse(data) {
        // Validate data
        const validation = await Course.validateData(data);

        if (!validation.valid) {
            throw new ValidationError(
                validation.errors[0]?.message || "Invalid course data"
            );
        }

        const baseSlug = normalizeSlug(data.slug || data.title);
        const slug = await this.generateUniqueSlug(baseSlug);

        const course = await Course.create({ ...data, slug });

        logger.info(`Course created: ${course.id}`);

        return course.toJSON();
    }

    /**
     * Update course (Admin only)
     */
    async updateCourse(courseId, data) {
        const course = await Course.findByPk(courseId);

        if (!course) {
            throw new NotFoundError("Course not found");
        }

        const updateData = { ...data };

        if (updateData.slug) {
            const normalizedSlug = normalizeSlug(updateData.slug);
            updateData.slug = await this.generateUniqueSlug(normalizedSlug, courseId);
        }

        await course.update(updateData);

        logger.info(`Course updated: ${courseId}`);

        return course.toJSON();
    }

    /**
     * Delete course (Admin only)
     */
    async deleteCourse(courseId) {
        const course = await Course.findByPk(courseId);

        if (!course) {
            throw new NotFoundError("Course not found");
        }

        // Check if has enrollments
        const enrollmentCount = await Enrollment.count({
            where: { courseId },
        });

        if (enrollmentCount > 0) {
            throw new ValidationError(
                "Cannot delete course with active enrollments. Set status to inactive instead."
            );
        }

        await course.destroy();

        logger.info(`Course deleted: ${courseId}`);

        return { success: true };
    }

    /**
     * Sync courses from Moodle
     */
    async syncFromMoodle() {
        const moodleCourses = await moodleService.getCourses();

        let synced = 0;
        let created = 0;
        let updated = 0;

        for (const moodleCourse of moodleCourses) {
            // Skip site/system courses
            if (moodleCourse.id === 1) continue;

            // Find existing course by Moodle ID
            const existing = await Course.findOne({
                where: { moodleCourseId: moodleCourse.id },
            });

            if (existing) {
                // Update existing course
                await existing.update({
                    title: moodleCourse.fullname,
                    description: moodleCourse.summary,
                });
                updated++;
            } else {
                const baseSlug = normalizeSlug(moodleCourse.fullname);
                const slug = await this.generateUniqueSlug(baseSlug);

                // Create new course
                await Course.create({
                    moodleCourseId: moodleCourse.id,
                    title: moodleCourse.fullname,
                    slug,
                    description: moodleCourse.summary,
                    price: 0, // Set manually later
                    status: "draft", // Require manual activation
                });
                created++;
            }

            synced++;
        }

        logger.info(`Synced ${synced} courses: ${created} created, ${updated} updated`);

        return { synced, created, updated };
    }

    /**
     * Add teacher to course
     */
    async addTeacher(courseId, teacherId, permissions = []) {
        const course = await Course.findByPk(courseId);

        if (!course) {
            throw new NotFoundError("Course not found");
        }

        const teacher = await User.findByPk(teacherId);

        if (!teacher) {
            throw new NotFoundError("Teacher not found");
        }

        if (!teacher.isTeacher() && !teacher.isAdmin()) {
            throw new ValidationError("User is not a teacher");
        }

        // Check if already assigned
        const existing = await CourseTeacher.findOne({
            where: { courseId, teacherId, removedAt: null },
        });

        if (existing) {
            throw new ValidationError("Teacher already assigned to this course");
        }

        // Add teacher
        await CourseTeacher.create({
            courseId,
            teacherId,
            permissions,
            assignedAt: new Date(),
        });

        logger.info(`Teacher ${teacherId} added to course ${courseId}`);

        return { success: true };
    }

    /**
     * Remove teacher from course
     */
    async removeTeacher(courseId, teacherId) {
        const assignment = await CourseTeacher.findOne({
            where: { courseId, teacherId, removedAt: null },
        });

        if (!assignment) {
            throw new NotFoundError("Teacher assignment not found");
        }

        await assignment.update({ removedAt: new Date() });

        logger.info(`Teacher ${teacherId} removed from course ${courseId}`);

        return { success: true };
    }

    /**
     * Add module to course
     */
    async addModule(courseId, moduleData) {
        const course = await Course.findByPk(courseId);

        if (!course) {
            throw new NotFoundError("Course not found");
        }

        // Get highest order index
        const lastModule = await CourseModule.findOne({
            where: { courseId },
            order: [["orderIndex", "DESC"]],
        });

        const orderIndex = lastModule ? lastModule.orderIndex + 1 : 0;

        const module = await CourseModule.create({
            ...moduleData,
            courseId,
            orderIndex,
        });

        logger.info(`Module added to course ${courseId}: ${module.id}`);

        return module.toJSON();
    }

    /**
     * Update module
     */
    async updateModule(moduleId, data) {
        const module = await CourseModule.findByPk(moduleId);

        if (!module) {
            throw new NotFoundError("Module not found");
        }

        await module.update(data);

        logger.info(`Module updated: ${moduleId}`);

        return module.toJSON();
    }

    /**
     * Delete module
     */
    async deleteModule(moduleId) {
        const module = await CourseModule.findByPk(moduleId);

        if (!module) {
            throw new NotFoundError("Module not found");
        }

        await module.destroy();

        logger.info(`Module deleted: ${moduleId}`);

        return { success: true };
    }

    /**
     * Reorder modules
     */
    async reorderModules(courseId, moduleIds) {
        const course = await Course.findByPk(courseId);

        if (!course) {
            throw new NotFoundError("Course not found");
        }

        // Update order index for each module
        for (let i = 0; i < moduleIds.length; i++) {
            await CourseModule.update(
                { orderIndex: i },
                { where: { id: moduleIds[i], courseId } }
            );
        }

        logger.info(`Modules reordered for course ${courseId}`);

        return { success: true };
    }

    /**
     * Get popular courses
     */
    async getPopularCourses(limit = 10) {
        const courses = await Course.findAll({
            where: { status: "active" },
            include: [
                {
                    model: Enrollment,
                    as: "enrollments",
                    attributes: [],
                },
            ],
            attributes: {
                include: [
                    [
                        Course.sequelize.fn("COUNT", Course.sequelize.col("enrollments.id")),
                        "enrollmentCount",
                    ],
                ],
            },
            group: ["Course.id"],
            order: [[Course.sequelize.literal('"enrollmentCount"'), "DESC"]],
            limit,
            subQuery: false,
        });

        return courses.map((c) => c.toJSON());
    }

    /**
     * Get courses by category
     */
    async getCoursesByCategory(category) {
        return await Course.findAll({
            where: { category, status: "active" },
            order: [["title", "ASC"]],
        });
    }

    /**
     * Get all categories
     */
    async getCategories() {
        const categories = await Course.findAll({
            attributes: ["category"],
            where: { status: "active", category: { [Op.ne]: null } },
            group: ["category"],
        });

        return categories.map((c) => c.category);
    }
}

export default new CourseService();
