/**
 * The company profile that links to a company user
 */

import mongoose from "mongoose";
import { BaseModel } from "../../shared/base.model.js";

class Company extends BaseModel {
  constructor() {
    const schemaDefinition = {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      industry: {
        type: String,
        required: true,
      },
      website: {
        type: String,
        default: "",
      },
      social_links: [
        {
          name: {
            type: String,
          },
          url: {
            type: String,
          },
        },
      ],
    };

    const options = {
      timestamps: true,
    };

    super(schemaDefinition, options);
  }
}

export default new Company().getModel("Company");
