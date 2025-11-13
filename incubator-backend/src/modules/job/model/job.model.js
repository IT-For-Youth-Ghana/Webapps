/**
 * The job model definition for the job module
 */
import { BaseModel } from "../../shared/base.model";
import { mongo } from "mongoose";

class Job extends BaseModel {
  constructor() {
    const schemaDefinition = {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      location: {
        type: String,
        required: false,
      },
      salary_range: {
        type: String,
        required: false,
      },
      job_type: {
        type: String,
        enum: ["full-time", "part-time", "internship", "contract", "remote", "hybrid"],
        required: true,
      },
      status: {
        type: String,
        enum: ["open", "closed", "paused", "draft", "deleted"],
        default: "open",
      },
      posted_at: {
        type: Date,
        default: Date.now,
      },
      closing_date: {
        type: Date,
        required: false,
      },
      company: {
        ref: "Company",
        type: mongo.Schema.Types.ObjectId,
        required: true, 
      }
    };

    const options = {
        timestamps: true,
    }

    super(schemaDefinition, options);
  }
}

export default new Job().getModel("Job");