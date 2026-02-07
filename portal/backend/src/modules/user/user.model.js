import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import BaseModel from "../../modules/shared/base.model.js";

class User extends BaseModel {
    /**
     * Instance methods
     */

    // Get full name
    getFullName() {
        return `${this.firstName} ${this.lastName}`.trim();
    }

    // Check role
    isStudent() {
        return this.role === 'student';
    }

    isTeacher() {
        return this.role === 'teacher';
    }

    isAdmin() {
        return this.role === 'admin' || this.role === 'super_admin';
    }

    // Verify password
    async verifyPassword(password) {
        return await bcrypt.compare(password, this.passwordHash);
    }

    // Public JSON (hide sensitive fields)
    toPublicJSON() {
        const json = this.toJSON();
        delete json.passwordHash;
        delete json.tempPassword;
        return json;
    }

    /**
     * Static methods
     */

    static async findByEmail(email) {
        return await this.findOne({ where: { email } });
    }

    static async findWithEnrollments(userId) {
        // These models must be imported or available via this.sequelize.models
        const { Enrollment, Course } = this.sequelize.models;

        return await this.findByPk(userId, {
            include: [
                {
                    model: Enrollment,
                    as: 'enrollments',
                    include: [
                        {
                            model: Course,
                            as: 'course',
                        },
                    ],
                },
            ],
        });
    }
}

// Initialize model
User.init(
    {
        // Basic info
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: {
                msg: 'Email already exists',
            },
            validate: {
                isEmail: {
                    msg: 'Invalid email format',
                },
                notEmpty: {
                    msg: 'Email is required',
                },
            },
        },

        passwordHash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'password_hash',
        },

        firstName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'first_name',
            validate: {
                len: {
                    args: [2, 100],
                    msg: 'First name must be between 2 and 100 characters',
                },
            },
        },

        lastName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'last_name',
            validate: {
                len: {
                    args: [2, 100],
                    msg: 'Last name must be between 2 and 100 characters',
                },
            },
        },

        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
            validate: {
                is: {
                    args: /^\+?[1-9]\d{1,14}$/,
                    msg: 'Invalid phone format',
                },
            },
        },

        dateOfBirth: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'date_of_birth',
        },

        // Role
        role: {
            type: DataTypes.ENUM('student', 'teacher', 'admin', 'super_admin'),
            defaultValue: 'student',
            allowNull: false,
            validate: {
                isIn: {
                    args: [['student', 'teacher', 'admin', 'super_admin']],
                    msg: 'Invalid role',
                },
            },
        },

        // External IDs
        moodleUserId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'moodle_user_id',
        },

        incubatorUserId: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'incubator_user_id',
        },

        // Metadata
        emailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'email_verified',
        },

        status: {
            type: DataTypes.ENUM('active', 'inactive', 'suspended'),
            defaultValue: 'active',
            allowNull: false,
        },

        tempPassword: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'temp_password',
        },
    },
    {
        tableName: 'users',
        indexes: [
            { fields: ['email'] },
            { fields: ['role'] },
            { fields: ['moodle_user_id'] },
            { fields: ['incubator_user_id'] },
        ],
        hooks: {
            // Hash password before creating user
            beforeCreate: async (user) => {
                if (user.passwordHash) {
                    user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
                }
            },

            // Hash password before updating if changed
            beforeUpdate: async (user) => {
                if (user.changed('passwordHash')) {
                    user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
                }
            },
        },
    }
);

// Define associations
User.associate = (models) => {
    // User has many enrollments
    User.hasMany(models.Enrollment, {
        foreignKey: 'userId',
        as: 'enrollments',
        onDelete: 'CASCADE',
    });

    // User has many payments
    User.hasMany(models.Payment, {
        foreignKey: 'userId',
        as: 'payments',
        onDelete: 'CASCADE',
    });

    // User has many notifications
    if (models.Notification) {
        User.hasMany(models.Notification, {
            foreignKey: 'userId',
            as: 'notifications',
            onDelete: 'CASCADE',
        });
    }

    // User teaches many courses (for teachers)
    if (models.Course && models.CourseTeacher) {
        User.belongsToMany(models.Course, {
            through: models.CourseTeacher,
            foreignKey: 'teacherId',
            as: 'taughtCourses',
        });
    }

    // User has one Admin profile
    if (models.Admin) {
        User.hasOne(models.Admin, {
            foreignKey: 'userId',
            as: 'adminProfile',
            onDelete: 'CASCADE',
        });
    }

    // User has many EmailLogs
    if (models.EmailLog) {
        User.hasMany(models.EmailLog, {
            foreignKey: 'userId',
            as: 'emailLogs',
        });
    }

    // User has many AuditLogs
    if (models.AuditLog) {
        User.hasMany(models.AuditLog, {
            foreignKey: 'userId',
            as: 'auditLogs',
        });
    }

    // User has many SystemSettings (as updatedBy)
    if (models.SystemSetting) {
        User.hasMany(models.SystemSetting, {
            foreignKey: 'updatedBy',
            as: 'updatedSettings',
        });
    }
};

export default User;
