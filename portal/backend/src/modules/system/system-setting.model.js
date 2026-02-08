import { DataTypes } from "sequelize";
import BaseModel from "../../modules/shared/base.model.js";

class SystemSetting extends BaseModel {
    /**
     * Check if setting is publicly accessible
     */
    isPublicSetting() {
        return this.isPublic;
    }

    /**
     * Get value typed (JSON parsing if needed)
     */
    getTypedValue() {
        try {
            return JSON.parse(this.value);
        } catch (e) {
            return this.value;
        }
    }
}

// Initialize model
SystemSetting.init(
    {
        key: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },

        value: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_public',
        },

        updatedBy: {
            type: DataTypes.STRING(36),
            allowNull: true,
            field: 'updated_by',
            references: {
                model: 'users',
                key: 'id',
            },
        },
    },
    {
        tableName: 'system_settings',
        indexes: [
            { unique: true, fields: ['key'] },
            { fields: ['is_public'] },
        ],
    }
);

// Define associations
SystemSetting.associate = (models) => {
    // Setting updated by user
    SystemSetting.belongsTo(models.User, {
        foreignKey: 'updatedBy',
        as: 'updater',
    });
};

export default SystemSetting;
