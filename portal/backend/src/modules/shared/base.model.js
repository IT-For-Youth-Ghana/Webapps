/**
 * Base Model for all Sequelize models
 * Provides common functionality, hooks, and methods
 */

import { Model, DataTypes } from "sequelize";
import sequelize from "../../database/client.js";
import { UUIDV4 } from "sequelize";

export const JSON_TYPE =
  sequelize.getDialect() === "postgres" ? DataTypes.JSONB : DataTypes.JSON;

class BaseModel extends Model {
  /**
   * Initialize model with common attributes and options
   */
  static init(attributes, options = {}) {
    // Add common timestamps to all models
    const baseAttributes = {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: UUIDV4,
      },
      ...attributes,
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at',
        defaultValue: DataTypes.NOW,
      },
    };

    // Merge default options
    const baseOptions = {
      sequelize,
      timestamps: true,
      underscored: true, // Use snake_case in database
      freezeTableName: false, // Pluralize table names
      ...options,
      hooks: {
        // Global hooks for all models
        beforeCreate: async (instance, options) => {
          // Run custom hook if exists
          if (options.hooks?.beforeCreate) {
            await options.hooks.beforeCreate(instance, options);
          }
        },
        beforeUpdate: async (instance, options) => {
          // Run custom hook if exists
          if (options.hooks?.beforeUpdate) {
            await options.hooks.beforeUpdate(instance, options);
          }
        },
        afterCreate: async (instance, options) => {
          // Log creation
          console.log(`[${instance.constructor.name}] Created: ID ${instance.id}`);
          
          // Run custom hook if exists
          if (options.hooks?.afterCreate) {
            await options.hooks.afterCreate(instance, options);
          }
        },
        afterUpdate: async (instance, options) => {
          // Run custom hook if exists
          if (options.hooks?.afterUpdate) {
            await options.hooks.afterUpdate(instance, options);
          }
        },
        ...options.hooks,
      },
    };

    return super.init(baseAttributes, baseOptions);
  }

  /**
   * Define associations - override in child models
   */
  static associate(models) {
    // Override this method in child models to define associations
  }

  /**
   * Get model instance as plain JSON
   * Override in child models to customize
   */
  toJSON() {
    const values = { ...this.get() };
    
    // Remove null values (optional)
    // Object.keys(values).forEach(key => {
    //   if (values[key] === null) delete values[key];
    // });
    
    return values;
  }

  /**
   * Get public-safe JSON (remove sensitive fields)
   * Override in child models
   */
  toPublicJSON() {
    return this.toJSON();
  }

  /**
   * Get only changed fields
   */
  getChangedFields() {
    const changed = this.changed();
    if (!changed) return {};

    const changes = {};
    changed.forEach(field => {
      changes[field] = {
        old: this._previousDataValues[field],
        new: this.dataValues[field],
      };
    });

    return changes;
  }

  /**
   * Check if instance is new (not persisted)
   */
  isNewRecord() {
    return this.isNewRecord;
  }

  /**
   * Soft delete support (if using paranoid)
   */
  async softDelete() {
    if (this.constructor.options.paranoid) {
      return await this.destroy();
    }
    throw new Error('Soft delete not enabled for this model');
  }

  /**
   * Restore soft-deleted record
   */
  async restore() {
    if (this.constructor.options.paranoid) {
      return await super.restore();
    }
    throw new Error('Soft delete not enabled for this model');
  }

  /**
   * Clone instance
   */
  clone() {
    const cloned = this.constructor.build(this.get());
    cloned.id = null; // Remove ID so it creates new record
    cloned.isNewRecord = true;
    return cloned;
  }

  /**
   * Reload instance from database
   */
  async refresh() {
    return await this.reload();
  }

  /**
   * Static method: Find or create
   */
  static async findOrCreate(options) {
    const [instance, created] = await super.findOrCreate(options);
    return { instance, created };
  }

  /**
   * Static method: Bulk create with validation
   */
  static async bulkCreateSafe(records, options = {}) {
    return await super.bulkCreate(records, {
      validate: true,
      individualHooks: true,
      ...options,
    });
  }

  /**
   * Static method: Update or create (upsert)
   */
  static async upsert(values, options = {}) {
    const [instance, created] = await super.upsert(values, options);
    return { instance, created };
  }

  /**
   * Static method: Count with conditions
   */
  static async countWhere(where) {
    return await this.count({ where });
  }

  /**
   * Static method: Exists check
   */
  static async exists(where) {
    const count = await this.count({ where, limit: 1 });
    return count > 0;
  }

  /**
   * Static method: Paginate results
   */
  static async paginate(options = {}) {
    const { page = 1, limit = 10, where = {}, include = [], order = [] } = options;
    
    const offset = (page - 1) * limit;

    const { count, rows } = await this.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
      distinct: true, // For accurate count with includes
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        hasNextPage: page < Math.ceil(count / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Static method: Get all with optional filters
   */
  static async getAll(filters = {}) {
    const { where = {}, include = [], order = [['created_at', 'DESC']] } = filters;
    
    return await this.findAll({
      where,
      include,
      order,
    });
  }

  /**
   * Static method: Find by ID with includes
   */
  static async findByIdWithIncludes(id, include = []) {
    return await this.findByPk(id, { include });
  }

  /**
   * Static method: Soft delete many
   */
  static async softDeleteMany(where) {
    if (!this.options.paranoid) {
      throw new Error('Soft delete not enabled for this model');
    }
    return await this.destroy({ where });
  }

  /**
   * Static method: Hard delete (force delete even if paranoid)
   */
  static async hardDelete(where) {
    return await this.destroy({ where, force: true });
  }

  /**
   * Static method: Transaction helper
   */
  static async executeInTransaction(callback) {
    return await sequelize.transaction(async (transaction) => {
      return await callback(transaction);
    });
  }

  /**
   * Static method: Validate data before create
   */
  static async validateData(data) {
    const instance = this.build(data);
    try {
      await instance.validate();
      return { valid: true, errors: [] };
    } catch (error) {
      return {
        valid: false,
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message,
        })),
      };
    }
  }
}

export default BaseModel;
