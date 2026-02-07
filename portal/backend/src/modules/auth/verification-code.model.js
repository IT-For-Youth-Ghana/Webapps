import { DataTypes } from "sequelize";
import BaseModel from "../../modules/shared/base.model.js";

class VerificationCode extends BaseModel {
    /**
     * Check if code is valid
     */
    isValid() {
        return !this.verified && new Date() < this.expiresAt;
    }
}

// Initialize model
VerificationCode.init(
    {
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        code: {
            type: DataTypes.STRING(6),
            allowNull: false,
        },

        registrationData: {
            type: DataTypes.JSONB,
            field: 'registration_data',
        },

        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'expires_at',
        },

        verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: 'verification_codes',
        indexes: [
            { fields: ['email'] },
            { fields: ['code'] },
            { fields: ['expires_at'] },
        ],
    }
);

// Define associations
VerificationCode.associate = (models) => {
    // Verification code belongs to optional User (if verifying existing user)
    // Note: Current schema doesn't show user_id, but it relates effectively to users via email

    // No direct FK in schema, so skipping direct association for now unless needed
};

export default VerificationCode;
