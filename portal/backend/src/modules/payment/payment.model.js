import { DataTypes } from "sequelize";
import BaseModel, { JSON_TYPE } from "../../modules/shared/base.model.js";

class Payment extends BaseModel {
    /**
     * Instance methods
     */

    getFormattedAmount() {
        return `${this.currency} ${parseFloat(this.amount).toFixed(2)}`;
    }

    isSuccessful() {
        return this.status === 'success';
    }

    isPending() {
        return this.status === 'pending';
    }

    isFailed() {
        return this.status === 'failed';
    }

    getAmountInKobo() {
        // Paystack uses kobo (1/100 of currency unit)
        return Math.round(parseFloat(this.amount) * 100);
    }

    // Hide sensitive data
    toPublicJSON() {
        const json = this.toJSON();
        delete json.paystackAccessCode;
        return json;
    }

    /**
     * Static methods
     */

    static async findByReference(reference) {
        return await this.findOne({
            where: { paystackReference: reference },
        });
    }

    static async findSuccessfulByUser(userId) {
        return await this.findAll({
            where: {
                userId,
                status: 'success',
            },
            order: [['paid_at', 'DESC']],
        });
    }
}

// Initialize model
Payment.init(
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

        enrollmentId: {
            type: DataTypes.STRING(36),
            allowNull: true,
            field: 'enrollment_id',
            references: {
                model: 'enrollments',
                key: 'id',
            },
        },

        // Payment details
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: {
                    args: [0],
                    msg: 'Amount must be greater than 0',
                },
            },
        },

        currency: {
            type: DataTypes.STRING(3),
            defaultValue: 'GHS',
            allowNull: false,
        },

        // Paystack info
        paystackReference: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            field: 'paystack_reference',
        },

        paystackAccessCode: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'paystack_access_code',
        },

        authorizationUrl: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'authorization_url',
        },

        // Status
        status: {
            type: DataTypes.ENUM('pending', 'success', 'failed', 'cancelled'),
            defaultValue: 'pending',
            allowNull: false,
        },

        paymentMethod: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'payment_method',
        },

        // Metadata
        metadata: {
            type: JSON_TYPE,
            defaultValue: {},
        },

        // Timestamps
        paidAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'paid_at',
        },
    },
    {
        tableName: 'payments',
        indexes: [
            { unique: true, fields: ['paystack_reference'] },
            { fields: ['user_id'] },
            { fields: ['status'] },
            { fields: ['paid_at'] },
        ],
        hooks: {
            // Auto-set paidAt when status changes to 'success'
            beforeUpdate: (payment) => {
                if (
                    payment.changed('status') &&
                    payment.status === 'success' &&
                    !payment.paidAt
                ) {
                    payment.paidAt = new Date();
                }
            },
        },
    }
);

// Define associations
Payment.associate = (models) => {
    // Payment belongs to user
    Payment.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
    });

    // Payment belongs to enrollment
    Payment.belongsTo(models.Enrollment, {
        foreignKey: 'enrollmentId',
        as: 'enrollment',
    });
};

export default Payment;
