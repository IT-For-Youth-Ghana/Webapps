import { DataTypes } from "sequelize";
import BaseModel from "../../modules/shared/base.model.js";

class AuditLog extends BaseModel {
    /**
     * Helper method to log change
     */
    static async log(data) {
        return await this.create(data);
    }
}

// Initialize model
AuditLog.init(
    {
        // User who performed the action
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'user_id',
            references: {
                model: 'users',
                key: 'id',
            },
        },

        adminId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'admin_id',
            references: {
                model: 'admins',
                key: 'id',
            },
        },

        // Action details
        action: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        entityType: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'entity_type',
        },

        entityId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'entity_id',
        },

        // Changes
        oldValues: {
            type: DataTypes.JSONB,
            field: 'old_values',
        },

        newValues: {
            type: DataTypes.JSONB,
            field: 'new_values',
        },

        // Client info
        ipAddress: {
            type: DataTypes.STRING(45),
            allowNull: true,
            field: 'ip_address',
        },

        userAgent: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'user_agent',
        },
    },
    {
        tableName: 'audit_logs',
        indexes: [
            { fields: ['user_id'] },
            { fields: ['action'] },
            { fields: ['entity_type', 'entity_id'] },
            { fields: ['created_at'] },
        ],
    }
);

// Define associations
AuditLog.associate = (models) => {
    // AuditLog belongs to optional User
    AuditLog.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
    });

    // AuditLog belongs to optional Admin
    if (models.Admin) {
        AuditLog.belongsTo(models.Admin, {
            foreignKey: 'adminId',
            as: 'admin',
        });
    }
};

export default AuditLog;
