/**
 * The shared repository for all modules
 * This file defines a reusable repository that can be extended by other repositories
 * It contains common data access methods for consistency across the application
 */

import mongoose from "mongoose";

class BaseRepository {
  /**
   * @param {mongoose.Model} model - The Mongoose model to be used by the repository
   */
  constructor(model) {
    if (new.target === BaseRepository) {
      throw new Error("BaseRepository is an abstract class and cannot be instantiated directly");
    }
    this.model = model;
  }

  /**
   * Find a document by its ID
   * @param {string|mongoose.Types.ObjectId} id - The ID of the document
   * @param {Object} [options] - Options: lean, select, populate, includeDeleted
   * @returns {Promise<Object|null>} - The found document or null
   * @throws {Error} If query fails
   */
  async findById(id, options = {}) {
    try {
      const query = this.model.findById(id);

      this._applyOptions(query, options);
      return await query.lean(options.lean).exec();
    } catch (error) {
      throw new Error(`Find by ID failed: ${error.message}`);
    }
  }

  /**
   * Find one document by query
   * @param {Object} filters - Query filters
   * @param {Object} [options] - Options: lean, select, populate, includeDeleted
   * @returns {Promise<Object|null>} - The found document or null
   * @throws {Error} If query fails
   */
  async findOne(filters, options = {}) {
    try {
      const query = this.model.findOne(filters);

      this._applyOptions(query, options);
      return await query.lean(options.lean).exec();
    } catch (error) {
      throw new Error(`Find one failed: ${error.message}`);
    }
  }

  /**
   * Find all documents with pagination
   * @param {Object} [filters={}] - Query filters
   * @param {number} [page=1] - Page number
   * @param {number} [limit=10] - Limit per page
   * @param {Object} [options] - Options: lean, select, sort, populate, includeDeleted
   * @returns {Promise<{ data: Array, metadata: Object }>} - Paginated results
   * @throws {Error} If query fails
   */
  async findAll(filters = {}, page = 1, limit = 10, options = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = this.model.find(filters).skip(skip).limit(limit);

      this._applyOptions(query, options);
      if (options.sort) query.sort(options.sort);

      const data = await query.lean(options.lean).exec();

      // Count query respects includeDeleted
      const countQuery = this.model.countDocuments(filters);
      if (options.includeDeleted) countQuery._includeDeleted = true;
      const total = await countQuery.exec();

      return {
        data,
        metadata: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit) || 1,
        },
      };
    } catch (error) {
      throw new Error(`Find all failed: ${error.message}`);
    }
  }

  /**
   * Create a new document
   * @param {Object} data - The data to create
   * @param {Object} [options] - Options: lean, exclude (for deserialize)
   * @returns {Promise<Object>} - The created document
   * @throws {Error} If creation fails
   */
  async create(data, options = {}) {
    try {
      const document = new this.model(data);
      const savedDoc = await document.save();
      return options.lean ? savedDoc.deserialize(options) : savedDoc;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error(`Duplicate key error: ${JSON.stringify(error.keyValue)}`);
      }
      throw new Error(`Creation failed: ${error.message}`);
    }
  }

  /**
   * Update a document by query
   * @param {Object} query - Query to find the document
   * @param {Object} data - Data to update
   * @param {Object} [options] - Options: lean, new: true, includeDeleted
   * @returns {Promise<Object|null>} - Updated document or null
   * @throws {Error} If update fails
   */
  async update(query, data, options = {}) {
    try {
      const updateQuery = this.model.findOneAndUpdate(
        query,
        { ...data, updated_at: Date.now() },
        { new: true, ...options }
      );

      if (options.includeDeleted) updateQuery._includeDeleted = true;
      this._applyOptions(updateQuery, options);

      return await updateQuery.lean(options.lean).exec();
    } catch (error) {
      throw new Error(`Update failed: ${error.message}`);
    }
  }

  /**
   * Update a document by ID
   * @param {string|mongoose.Types.ObjectId} id - Document ID
   * @param {Object} data - Data to update
   * @param {Object} [options] - Options: lean, includeDeleted
   * @returns {Promise<Object|null>} - Updated document
   * @throws {Error} If update fails
   */
  async updateById(id, data, options = {}) {
    return this.update({ _id: id }, data, options);
  }

  /**
   * Soft delete a document by ID
   * @param {Object} query - Query to find the document
   * @param {Object} [options] - Options: lean
   * @returns {Promise<Object|null>} - Soft-deleted document
   * @throws {Error} If delete fails
   */
  async delete(query, options = {}) {
    try {
      const deleteQuery = this.model.findOneAndUpdate(
        query,
        { deleted_at: Date.now() },
        { new: true }
      );
      if (options.includeDeleted) deleteQuery._includeDeleted = true;
      return await deleteQuery.lean(options.lean).exec();
    } catch (error) {
      throw new Error(`Soft delete failed: ${error.message}`);
    }
  }

  /**
   * Restore a soft-deleted document by ID
   * @param  {Object} - Query 
   * @param {Object} [options] - Options: lean
   * @returns {Promise<Object|null>} - Restored document
   * @throws {Error} If restore fails
   */
  async restore(query, options = {}) {
    try {
      const q = this.model.findOneAndUpdate(
        query,
        { deleted_at: null },
        { new: true }
      );
      q._includeDeleted = true; // Bypass filter to find deleted doc
      return await q.lean(options.lean).exec();
    } catch (error) {
      throw new Error(`Restore failed: ${error.message}`);
    }
  }

  /**
   * Permanently delete a document by ID
   * @param {Object} query - 
   * @param {Object} [options] - Options: includeDeleted
   * @returns {Promise<Object|null>} - Deleted document
   * @throws {Error} If force delete fails
   */
  async forceDelete(query, options = {}) {
    try {
      const q = this.model.findOneAndDelete(query);
      if (options.includeDeleted) q._includeDeleted = true;
      return await q.exec();
    } catch (error) {
      throw new Error(`Force delete failed: ${error.message}`);
    }
  }

  /**
   * Execute a callback within a Mongoose transaction
   * @param {Function} callback - Async function with session
   * @returns {Promise<any>} - Result of callback
   * @throws {Error} If transaction fails
   */
  async transaction(callback) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Perform aggregation
   * @param {Array} pipeline - Aggregation pipeline
   * @param {Object} [options] - Options: allowDiskUse
   * @returns {Promise<Array>} - Aggregation result
   * @throws {Error} If aggregation fails
   */
  async aggregate(pipeline, options = {}) {
    try {
      const agg = this.model.aggregate(pipeline);
      if (options.allowDiskUse) agg.allowDiskUse(true);
      return await agg.exec();
    } catch (error) {
      throw new Error(`Aggregation failed: ${error.message}`);
    }
  }

  // === PRIVATE HELPER ===
  _applyOptions(query, options) {
    if (options.select) query.select(options.select);
    if (options.populate) {
      // Only apply populate if it's a string or array, not a boolean flag
      if (typeof options.populate === 'string') {
        query.populate(options.populate);
      } else if (Array.isArray(options.populate)) {
        options.populate.forEach(p => query.populate(p));
      }
      // If it's a boolean (true/false), ignore it - let the service handle population logic
    }
    if (options.includeDeleted) {
      query._includeDeleted = true;
    }
  }
}

export { BaseRepository };