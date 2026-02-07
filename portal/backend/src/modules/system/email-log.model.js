import { DataTypes } from "sequelize";
import BaseModel from "../../modules/shared/base.model.js";

class EmailLog extends BaseModel {
    /**
     * Instance methods
     */
}

// Initialize model
EmailLog.init(
    {
        // Recipient
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'user_id',
            references: {
                model: 'users',
                key: 'id',
            },
        },

        toEmail: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'to_email',
        },

        // Content
        subject: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },

        template: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        // Status
        status: {
            type: DataTypes.ENUM('pending', 'sent', 'failed', 'opened', 'clicked'),
            defaultValue: 'pending',
        },

        providerId: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'provider_id',
        },

        errorMessage: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'error_message',
        },

        // Timestamps
        sentAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'sent_at',
        },

        openedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'opened_at',
        },

        clickedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'clicked_at',
        },
    },
    {
        tableName: 'email_logs',
        indexes: [
            { fields: ['user_id'] },
            { fields: ['to_email'] },
            { fields: ['status'] },
            { fields: ['template'] },
        ],
    }
);

// Define associations
EmailLog.associate = (models) => {
    // EmailLog belongs to optional User
    EmailLog.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
    });
};

export default EmailLog;
