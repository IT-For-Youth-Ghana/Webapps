import { DataTypes } from "sequelize";
import BaseModel from "../../modules/shared/base.model.js";

class Course extends BaseModel {
    /**
     * Instance methods
     */

    getFormattedPrice() {
        return `${this.currency} ${parseFloat(this.price).toFixed(2)}`;
    }

    isActive() {
        return this.status === 'active';
    }

    isFree() {
        return parseFloat(this.price) === 0;
    }

    /**
     * Static methods
     */

    static async findByMoodleId(moodleId) {
        return await this.findOne({
            where: { moodleCourseId: moodleId?.toString() },
        });
    }

    static async findActive() {
        return await this.findAll({
            where: { status: 'active' },
            order: [['title', 'ASC']],
        });
    }

    static async findWithTeachers(courseId) {
        const { User } = this.sequelize.models;

        return await this.findByPk(courseId, {
            include: [
                {
                    model: User,
                    as: 'teachers',
                    through: { attributes: [] }, // Exclude join table attributes
                },
            ],
        });
    }
}

// Initialize model
Course.init(
    {
        // Course info
        moodleCourseId: {
            type: DataTypes.STRING(36),
            allowNull: true,
            unique: true,
            field: 'moodle_course_id',
        },

        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: {
                    args: [3, 255],
                    msg: 'Title must be between 3 and 255 characters',
                },
            },
        },

        slug: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true,
            validate: {
                len: {
                    args: [1, 255],
                    msg: 'Slug must be between 1 and 255 characters',
                },
            },
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        shortDescription: {
            type: DataTypes.STRING(500),
            allowNull: true,
            field: 'short_description',
        },

        // Pricing
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: {
                    args: [0],
                    msg: 'Price cannot be negative',
                },
            },
        },

        currency: {
            type: DataTypes.STRING(3),
            defaultValue: 'GHS',
            allowNull: false,
        },

        // Course details
        durationWeeks: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'duration_weeks',
            validate: {
                min: {
                    args: [1],
                    msg: 'Duration must be at least 1 week',
                },
            },
        },

        level: {
            type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
            defaultValue: 'beginner',
            allowNull: false,
        },

        category: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },

        // Media
        thumbnailUrl: {
            type: DataTypes.STRING(500),
            allowNull: true,
            field: 'thumbnail_url',
            validate: {
                isUrl: {
                    msg: 'Invalid thumbnail URL',
                },
            },
        },

        // Status
        status: {
            type: DataTypes.ENUM('draft', 'active', 'inactive'),
            defaultValue: 'draft',
            allowNull: false,
        },

        // Sync metadata
        lastSyncedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'last_synced_at',
        },

        syncStatus: {
            type: DataTypes.ENUM('pending', 'synced', 'error'),
            defaultValue: 'pending',
            allowNull: false,
            field: 'sync_status',
        },

        lastSyncError: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'last_sync_error',
        },
    },
    {
        tableName: 'courses',
        indexes: [
            { fields: ['moodle_course_id'] },
            { unique: true, fields: ['slug'] },
            { fields: ['status'] },
            { fields: ['category'] },
            { fields: ['level'] },
            { fields: ['sync_status'] },
            { fields: ['last_synced_at'] },
        ],
        hooks: {
            beforeValidate: (course) => {
                if (!course.slug && course.title) {
                    course.slug = course.title
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_-]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                }
            },
        },
    }
);

// Define associations
Course.associate = (models) => {
    // Course has many enrollments
    Course.hasMany(models.Enrollment, {
        foreignKey: 'courseId',
        as: 'enrollments',
        onDelete: 'CASCADE',
    });

    // Course has many modules
    if (models.CourseModule) {
        Course.hasMany(models.CourseModule, {
            foreignKey: 'courseId',
            as: 'modules',
            onDelete: 'CASCADE',
        });
    }

    // Course has many teachers
    if (models.User && models.CourseTeacher) {
        Course.belongsToMany(models.User, {
            through: models.CourseTeacher,
            foreignKey: 'courseId',
            as: 'teachers',
        });
    }
};

export default Course;
