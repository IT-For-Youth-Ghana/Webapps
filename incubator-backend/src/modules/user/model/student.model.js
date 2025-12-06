/**
 * The student model that inherits from the user model
 */

import mongoose from "mongoose";
import { BaseModel } from "../../shared/base.model.js";

class Student extends BaseModel {

    constructor(){
        const schemaDefinition = {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },

            first_name: {
                type: String,
                required: true
            },
            last_name: {
                type: String,
                required: true
            },
            bio: {
                type: String,
                default: ""
            },
            social_links: [{
                name: {
                    type: String
                },
                url: {
                    type: String
                }
            }],
            cv_url: {
                type: String
            },
            skills: [{
                type: String
            }],
            education: [
                {
                    school: {
                        type: String,
                        required: true
                    },
                    qualification: {
                        type: String,
                        required: true
                    },
                    field_of_study: {
                        type: String,
                        required: true
                    },
                    start_date:{
                        type: Date,
                        required: true
                    },
                    end_date: {
                        type: Date,
                        default: null
                    },
                    is_current: {
                        type: Boolean,
                        default: false
                    }
                }
            ],
            work_experience: [{
                title: {
                    type: String,
                    required: true
                },
                company: {
                    type: String,
                    required: true
                },
                location: {
                    type: String,
                    required: true
                },
                start_date: {
                    type: Date,
                    required: true
                },
                end_date: {
                    type: Date,
                    default: null
                },
                is_current: {
                    type: Boolean,
                    default: true
                },
                description: {
                    type: String,
                    default: ""
                },
            }],
            status: {
                    type: String,
                    enum: ["active", "job_seeking", "inactive"],
                    default: "active"
                }
        }

        const options = {
            timestamps: true
        }

        super(schemaDefinition, options);
    }
}

export default new Student().getModel("Student");