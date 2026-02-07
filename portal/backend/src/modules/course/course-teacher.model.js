import { DataTypes } from "sequelize";
import BaseModel from "../../modules/shared/base.model.js";

class CourseTeacher extends BaseModel {
    /**
     * Helper method to check permission
     */
    hasPermission(permission) {
        if (!this.permissions) return false;
        return this.permissions.includes(permission) || this.permissions.includes('all');
    }
}

// Initialize model
CourseTeacher.init(
    {
        // Foreign keys
        courseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'course_id',
            references: {
                model: 'courses',
                key: 'id',
            },
            primaryKey: true,
        },

        teacherId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'teacher_id',
            references: {
                model: 'users',
                key: 'id',
            },
            primaryKey: true,
        },

        // Permissions (e.g., ['edit_content', 'grade_assignments', 'manage_students'])
        permissions: {
            type: DataTypes.JSONB,
            defaultValue: [],
            allowNull: false,
        },

        // Status
        assignedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'assigned_at',
            allowNull: false,
        },

        removedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'removed_at',
        },
    },
    {
        tableName: 'course_teachers',
        indexes: [
            { fields: ['course_id'] },
            { fields: ['teacher_id'] },
        ],
    }
);

export default CourseTeacher;
