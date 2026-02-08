import { DataTypes } from "sequelize";
import BaseModel, { JSON_TYPE } from "../../modules/shared/base.model.js";

class Notification extends BaseModel {
    /**
     * Instance methods
     */
    markAsRead() {
        this.isRead = true;
        this.readAt = new Date();
        return this.save();
    }
}

// Initialize model
Notification.init(
    {
        // Foreign keys
        userId: {
            type: DataTypes.STRING(36),
            allowNull: false,
            field: 'user_id',
            references: {
                model: 'users',
                key: 'id',
            },
        },

        // Notification details
        type: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },

        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        link: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },

        metadata: {
            type: JSON_TYPE,
            defaultValue: {},
        },

        // Status
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_read',
        },

        readAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'read_at',
        },
    },
    {
        tableName: 'notifications',
        indexes: [
            { fields: ['user_id'] },
            { fields: ['is_read'] },
            { fields: ['type'] },
        ],
    }
);

// Define associations
Notification.associate = (models) => {
    // Notification belongs to user
    Notification.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
    });
};

export default Notification;
