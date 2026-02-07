import sequelize from "../database/client.js";

// Core Models
import User from "../modules/user/user.model.js";
import Course from "../modules/course/course.model.js";
import Enrollment from "../modules/enrollment/enrollment.model.js";
import Payment from "../modules/payment/payment.model.js";

// Supporting Domain Models
import CourseTeacher from "../modules/course/course-teacher.model.js";
import CourseModule from "../modules/course/course-module.model.js";
import StudentProgress from "../modules/enrollment/student-progress.model.js";

// System & Extra Models
import Notification from "../modules/notification/notification.model.js";
import Admin from "../modules/admin/admin.model.js";
import AuditLog from "../modules/system/audit-log.model.js";
import EmailLog from "../modules/system/email-log.model.js";
import SystemSetting from "../modules/system/system-setting.model.js";
import VerificationCode from "../modules/auth/verification-code.model.js";

const models = {
    // Core
    User,
    Course,
    Enrollment,
    Payment,

    // Supporting
    CourseTeacher,
    CourseModule,
    StudentProgress,

    // System/Extra
    Notification,
    Admin,
    AuditLog,
    EmailLog,
    SystemSetting,
    VerificationCode,
};

// Initialize associations
Object.values(models).forEach((model) => {
    if (model.associate) {
        model.associate(models);
    }
});

export default models;
export { sequelize };
