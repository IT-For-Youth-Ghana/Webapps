import { DataTypes } from "sequelize";
import BaseModel from "../../modules/shared/base.model.js";

class StudentProgress extends BaseModel {
    /**
     * Instance methods
     */
    isCompleted() {
        return this.status === 'completed';
    }

    isInProgress() {
        return this.status === 'in_progress';
    }
}

// Initialize model
StudentProgress.init(
    {
        // Foreign keys
        enrollmentId: {
            type: DataTypes.STRING(36),
            allowNull: false,
            field: 'enrollment_id',
            references: {
                model: 'enrollments',
                key: 'id',
            },
        },

        moduleId: {
            type: DataTypes.STRING(36),
            allowNull: false,
            field: 'module_id',
            references: {
                model: 'course_modules',
                key: 'id',
            },
        },

        // Progress details
        status: {
            type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
            defaultValue: 'not_started',
            allowNull: false,
        },

        score: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            validate: {
                min: 0,
                max: 100,
            },
        },

        // Timestamps
        startedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'started_at',
        },

        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'completed_at',
        },
    },
    {
        tableName: 'student_progress',
        indexes: [
            { unique: true, fields: ['enrollment_id', 'module_id'] },
            { fields: ['status'] },
        ],
        hooks: {
            // Auto-set startedAt
            beforeUpdate: (progress) => {
                if (
                    progress.changed('status') &&
                    progress.status === 'in_progress' &&
                    !progress.startedAt
                ) {
                    progress.startedAt = new Date();
                }

                // Auto-set completedAt
                if (
                    progress.changed('status') &&
                    progress.status === 'completed' &&
                    !progress.completedAt
                ) {
                    progress.completedAt = new Date();
                }
            },
        },
    }
);

// Define associations
StudentProgress.associate = (models) => {
    // Progress belongs to enrollment
    StudentProgress.belongsTo(models.Enrollment, {
        foreignKey: 'enrollmentId',
        as: 'enrollment',
    });

    // Progress belongs to module
    StudentProgress.belongsTo(models.CourseModule, {
        foreignKey: 'moduleId',
        as: 'module',
    });
};

export default StudentProgress;
