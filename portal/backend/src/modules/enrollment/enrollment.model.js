import { DataTypes } from "sequelize";
import BaseModel from "../../modules/shared/base.model.js";

class Enrollment extends BaseModel {
    /**
     * Instance methods
     */

    isActive() {
        return this.enrollmentStatus === 'enrolled';
    }

    isCompleted() {
        return this.enrollmentStatus === 'completed';
    }

    isPending() {
        return this.enrollmentStatus === 'pending';
    }

    getDaysSinceEnrollment() {
        if (!this.enrolledAt) return 0;

        const now = new Date();
        const diffTime = Math.abs(now - this.enrolledAt);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    getProgressStatus() {
        const progress = parseInt(this.progressPercentage);

        if (progress === 0) return 'Not Started';
        if (progress < 25) return 'Just Started';
        if (progress < 50) return 'In Progress';
        if (progress < 75) return 'Halfway There';
        if (progress < 100) return 'Almost Done';
        return 'Completed';
    }

    /**
     * Static methods
     */

    static async findByUserAndCourse(userId, courseId) {
        return await this.findOne({
            where: { userId, courseId },
        });
    }

    static async findActiveByUser(userId) {
        return await this.findAll({
            where: {
                userId,
                enrollmentStatus: 'enrolled',
            },
            include: [
                {
                    model: this.sequelize.models.Course,
                    as: 'course',
                },
            ],
            order: [['enrolled_at', 'DESC']],
        });
    }
}

// Initialize model
Enrollment.init(
    {
        // Foreign keys
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',
            references: {
                model: 'users',
                key: 'id',
            },
        },

        courseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'course_id',
            references: {
                model: 'courses',
                key: 'id',
            },
        },

        // Payment info
        paymentReference: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'payment_reference',
        },

        paymentStatus: {
            type: DataTypes.ENUM('pending', 'completed', 'failed'),
            defaultValue: 'pending',
            allowNull: false,
            field: 'payment_status',
        },

        // Enrollment status
        enrollmentStatus: {
            type: DataTypes.ENUM('pending', 'enrolled', 'completed', 'dropped'),
            defaultValue: 'pending',
            allowNull: false,
            field: 'enrollment_status',
        },

        // Progress
        progressPercentage: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
            field: 'progress_percentage',
            validate: {
                min: {
                    args: [0],
                    msg: 'Progress cannot be negative',
                },
                max: {
                    args: [100],
                    msg: 'Progress cannot exceed 100%',
                },
            },
        },

        // Timestamps
        enrolledAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'enrolled_at',
        },

        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'completed_at',
        },

        lastAccessed: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'last_accessed',
        },
    },
    {
        tableName: 'enrollments',
        indexes: [
            { unique: true, fields: ['user_id', 'course_id'] },
            { fields: ['payment_status'] },
            { fields: ['enrollment_status'] },
            { fields: ['enrolled_at'] },
        ],
        hooks: {
            // Auto-set enrolledAt when status changes to 'enrolled'
            beforeUpdate: (enrollment) => {
                if (
                    enrollment.changed('enrollmentStatus') &&
                    enrollment.enrollmentStatus === 'enrolled' &&
                    !enrollment.enrolledAt
                ) {
                    enrollment.enrolledAt = new Date();
                }

                // Auto-set completedAt when status changes to 'completed'
                if (
                    enrollment.changed('enrollmentStatus') &&
                    enrollment.enrollmentStatus === 'completed' &&
                    !enrollment.completedAt
                ) {
                    enrollment.completedAt = new Date();
                }
            },
        },
    }
);

// Define associations
Enrollment.associate = (models) => {
    // Enrollment belongs to user
    Enrollment.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
    });

    // Enrollment belongs to course
    Enrollment.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course',
    });

    // Enrollment has many progress records
    if (models.StudentProgress) {
        Enrollment.hasMany(models.StudentProgress, {
            foreignKey: 'enrollmentId',
            as: 'progressRecords',
            onDelete: 'CASCADE',
        });
    }

    // Enrollment has one payment
    if (models.Payment) {
        Enrollment.hasOne(models.Payment, {
            foreignKey: 'enrollmentId',
            as: 'payment',
        });
    }
};

export default Enrollment;
