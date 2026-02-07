import { DataTypes } from "sequelize";
import BaseModel from "../../modules/shared/base.model.js";

class Admin extends BaseModel {
    /**
     * Instance methods
     */
}

// Initialize model
Admin.init(
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

        // Telegram integration
        telegramChatId: {
            type: DataTypes.STRING(50),
            allowNull: true,
            unique: true,
            field: 'telegram_chat_id',
        },

        telegramUsername: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'telegram_username',
        },

        // Access control
        role: {
            type: DataTypes.STRING(20),
            defaultValue: 'moderator',
        },

        permissions: {
            type: DataTypes.JSONB,
            defaultValue: [],
        },

        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'last_login',
        },
    },
    {
        tableName: 'admins',
        indexes: [
            { fields: ['user_id'] },
            { fields: ['telegram_chat_id'] },
        ],
    }
);

// Define associations
Admin.associate = (models) => {
    // Admin belongs to user
    Admin.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
    });

    // Admin has many audit logs
    if (models.AuditLog) {
        Admin.hasMany(models.AuditLog, {
            foreignKey: 'adminId',
            as: 'auditLogs',
        });
    }
};

export default Admin;
