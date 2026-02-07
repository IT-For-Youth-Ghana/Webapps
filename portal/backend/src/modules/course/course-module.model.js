import { DataTypes } from "sequelize";
import BaseModel from "../../modules/shared/base.model.js";

class CourseModule extends BaseModel {
    /**
     * Instance methods
     */
}

// Initialize model
CourseModule.init(
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
        },

        // External IDs
        moodleModuleId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'moodle_module_id',
        },

        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        // Module details
        moduleType: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'module_type',
        },

        orderIndex: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'order_index',
        },

        isRequired: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_required',
        },
    },
    {
        tableName: 'course_modules',
        indexes: [
            { fields: ['course_id'] },
            { fields: ['moodle_module_id'] },
            { fields: ['order_index'] },
        ],
    }
);

// Define associations
CourseModule.associate = (models) => {
    // Module belongs to course
    CourseModule.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course',
    });

    // Module has many progress records
    if (models.StudentProgress) {
        CourseModule.hasMany(models.StudentProgress, {
            foreignKey: 'moduleId',
            as: 'studentProgress',
            onDelete: 'CASCADE',
        });
    }
};

export default CourseModule;
