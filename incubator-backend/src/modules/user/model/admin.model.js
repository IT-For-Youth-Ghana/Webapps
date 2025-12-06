/**
 * The admin model that links to a user
 */

import mongoose from "mongoose";
import { BaseModel } from "../../shared/base.model.js";

class Admin extends BaseModel {
    constructor(){
        const schemaDefinition = {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            permissions: {
                type: [String],
                enum: ["create", "update", "read", "delete", "super"],
                default: ["read"]
            },
            title: {
                type: String,
                default: "moderator"
            }
        }

        const options = {
            timestamps: true,
        }

        super(schemaDefinition, options)
    }
}

export default new Admin().getModel("Admin")