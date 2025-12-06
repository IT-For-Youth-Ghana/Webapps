/**
 * The user model definition for the user module
 */

import { AuthHelpers } from "../../../utils/helpers/auth.helpers.js";
import { BaseModel } from "../../shared/base.model.js";

class User extends BaseModel {
  constructor() {
    const schemaDefinition = {
      email: {
        type: String,
        required: true,
      },
      password_hash: {
        type: String,
        required: true,
        select: false, // Prevent password_hash from being returned by default
      },
      photo_url: {
        type: String,
        default: null,
      },
      role: {
        type: String,
        enum: ["student", "company", "admin"],
        required: true,
      },
      is_active: {
        type: Boolean,
        default: true,
      },
      status: {
        type: String,
        enum: ["approved", "pending", "deleted", "rejected"],
        default: "pending",
      },
      email_verified: {
        type: Boolean,
        default: false,
      },
      last_login: {
        type: Date,
        default: null,
      },
      email_verified_at: {
        type: Date,
        default: null,
      },
      locked_until: {
        type: Date,
        default: null
      },
      login_attempts: {
        type: Number,
        default: 0
      }
    };

    const options = {
      timestamps: true, // Use Mongoose timestamps
    };

    super(schemaDefinition, options);

    // Additional index for better query performance
    this.schema.index({ email: 1 }, { unique: true });

    // Custom pre-save hook for plain password handling
    this.schema.pre("save", async function (next) {
      try {
        if (this.isModified("password_hash")) {
          // If password_hash is a plain text password, hash it
          if (!this.password_hash.startsWith("$2b$")) { // Check if already hashed
            this.password_hash = await AuthHelpers.hashPassword(this.password_hash)
          }
        }
        next();
      } catch (error) {
        next(error);
      }
    });

    // Custom method to set password
    this.schema.methods.setPassword = async function (password) {
      this.password_hash =  await AuthHelpers.hashPassword(password)
      return this.save();
    };

    // Custom method to verify password
    this.schema.methods.verifyPassword = async function (password) {
      return await AuthHelpers.comparePassword(password, this.password_hash)
    };
  }
}

// Export the model
export default new User().getModel("User");