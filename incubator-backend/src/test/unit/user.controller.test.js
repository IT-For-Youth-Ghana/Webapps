/* eslint-disable no-undef */
/**
 * User Controller Tests
 * Comprehensive tests for all user controller endpoints
 * Tests HTTP request/response handling, authentication, and authorization
 */

import userController from "../../modules/user/controller/user.controller";
import User from "../../modules/user/model/user.model";
import Student from "../../modules/user/model/student.model";
import Company from "../../modules/user/model/company.model";
import Admin from "../../modules/user/model/admin.model";
import { clearDB, connectDB, disconnectDB } from "../setup/setup.db";

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Mock request object
const mockRequest = (overrides = {}) => {
  return {
    query: {},
    params: {},
    body: {},
    user: null,
    file: null,
    ...overrides,
  };
};

describe("User Controller", () => {
  let studentUser;
  let companyUser;
  let adminUser;

  beforeAll(async () => {
    await connectDB();

    // Create test users
    studentUser = await User.create({
      email: "student@test.com",
      password_hash: "TestPassword123!",
      role: "student",
      status: "approved",
      is_active: true,
    });

    companyUser = await User.create({
      email: "company@test.com",
      password_hash: "TestPassword123!",
      role: "company",
      status: "approved",
      is_active: true,
    });

    adminUser = await User.create({
      email: "admin@test.com",
      password_hash: "TestPassword123!",
      role: "admin",
      status: "approved",
      is_active: true,
    });

    // Create profiles
    await Student.create({
      user: studentUser._id,
      first_name: "John",
      last_name: "Student",
      skills: ["JavaScript", "React"],
    });

    await Company.create({
      user: companyUser._id,
      name: "Test Company",
      description: "A test company for testing purposes",
      industry: "Technology",
    });

    await Admin.create({
      user: adminUser._id,
      name: "Admin User",
      title: "System Administrator",
      permissions: ["create", "read", "update", "delete"],
    });
  });

  afterAll(async () => {
    await clearDB();
    await disconnectDB();
  });

  // ========================================
  // 1. PROFILE MANAGEMENT TESTS
  // ========================================

  describe("getMyProfile", () => {
    test("should get authenticated user profile", async () => {
      const req = mockRequest({
        user: { _id: studentUser._id, role: "student" },
      });
      const res = mockResponse();

      await userController.getMyProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data.user.email).toBe("student@test.com");
    }, 15000);

    test("should return 404 for non-existent user", async () => {
      const fakeId = "507f1f77bcf86cd799439999";
      const req = mockRequest({
        user: { _id: fakeId, role: "student" },
      });
      const res = mockResponse();

      await userController.getMyProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(false);
    }, 15000);
  });

  describe("updateMyProfile", () => {
    test("should update student profile successfully", async () => {
      const req = mockRequest({
        user: { _id: studentUser._id, role: "student" },
        body: {
          first_name: "Jane",
          last_name: "UpdatedStudent",
        },
      });
      const res = mockResponse();

      await userController.updateMyProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
    }, 15000);

    test("should update company profile successfully", async () => {
      const req = mockRequest({
        user: { _id: companyUser._id, role: "company" },
        body: {
          name: "Updated Company Name",
        },
      });
      const res = mockResponse();

      await userController.updateMyProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
    }, 15000);

    test("should handle validation errors", async () => {
      const req = mockRequest({
        user: { _id: studentUser._id, role: "student" },
        body: {
          email: "invalid-email", // Invalid email format
        },
      });
      const res = mockResponse();

      await userController.updateMyProfile(req, res);

      // Should handle validation error gracefully
      expect(res.status).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    }, 15000);
  });

  describe("uploadPhoto", () => {
    test("should upload photo successfully", async () => {
      const req = mockRequest({
        user: { _id: studentUser._id, role: "student" },
        file: {
          filename: "test-photo.jpg",
          originalname: "photo.jpg",
          mimetype: "image/jpeg",
          size: 102400,
        },
      });
      const res = mockResponse();

      await userController.uploadPhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
    }, 15000);

    test("should return 400 when no file is uploaded", async () => {
      const req = mockRequest({
        user: { _id: studentUser._id, role: "student" },
        file: null,
      });
      const res = mockResponse();

      await userController.uploadPhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(false);
    }, 15000);
  });

  describe("deleteMyAccount", () => {
    test("should soft delete user account", async () => {
      // Create a user to delete
      const userToDelete = await User.create({
        email: "todelete@test.com",
        password_hash: "TestPassword123!",
        role: "student",
        status: "approved",
      });

      const req = mockRequest({
        user: { _id: userToDelete._id, role: "student" },
      });
      const res = mockResponse();

      await userController.deleteMyAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);

      // Verify user is soft deleted
      const deletedUser = await User.findById(userToDelete._id);
      expect(deletedUser.deleted_at).toBeDefined();
    }, 15000);
  });

  // ========================================
  // 2. ADMIN USER MANAGEMENT TESTS
  // ========================================

  describe("listUsers", () => {
    test("should list all users with pagination", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        query: { page: "1", limit: "10" },
      });
      const res = mockResponse();

      await userController.listUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.metadata).toBeDefined();
      expect(responseData.metadata.page).toBe(1);
    }, 15000);

    test("should filter users by role", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        query: { role: "student", page: "1", limit: "10" },
      });
      const res = mockResponse();

      await userController.listUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
    }, 15000);

    test("should filter users by status", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        query: { status: "approved", page: "1", limit: "10" },
      });
      const res = mockResponse();

      await userController.listUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
    }, 15000);
  });

  describe("listStudents", () => {
    test("should list only students", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        query: { page: "1", limit: "10" },
      });
      const res = mockResponse();

      await userController.listStudents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
    }, 15000);
  });

  describe("listCompanies", () => {
    test("should list only companies", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        query: { page: "1", limit: "10" },
      });
      const res = mockResponse();

      await userController.listCompanies(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
    }, 15000);
  });

  describe("listAdmins", () => {
    test("should list only admins", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        query: { page: "1", limit: "10" },
      });
      const res = mockResponse();

      await userController.listAdmins(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
    }, 15000);
  });

  describe("getUserById", () => {
    test("should get user by ID as admin", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        params: { id: studentUser._id.toString() },
      });
      const res = mockResponse();

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
    }, 15000);

    test("should allow user to get own profile", async () => {
      const req = mockRequest({
        user: { _id: studentUser._id.toString(), role: "student" },
        params: { id: studentUser._id.toString() },
      });
      const res = mockResponse();

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
    }, 15000);

    test("should forbid non-admin from accessing other user profiles", async () => {
      const req = mockRequest({
        user: { _id: studentUser._id.toString(), role: "student" },
        params: { id: companyUser._id.toString() },
      });
      const res = mockResponse();

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(false);
    }, 15000);

    test("should return 404 for non-existent user", async () => {
      const fakeId = "507f1f77bcf86cd799439999";
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        params: { id: fakeId },
      });
      const res = mockResponse();

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalled();
    }, 15000);
  });

  // ========================================
  // 3. ADMIN ACTIONS TESTS
  // ========================================

  describe("approveUser", () => {
    test("should approve pending user", async () => {
      // Create pending user
      const pendingUser = await User.create({
        email: "pending@test.com",
        password_hash: "TestPassword123!",
        role: "student",
        status: "pending",
      });

      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        params: { id: pendingUser._id.toString() },
      });
      const res = mockResponse();

      await userController.approveUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);

      // Verify status changed
      const updatedUser = await User.findById(pendingUser._id);
      expect(updatedUser.status).toBe("approved");
    }, 15000);
  });

  describe("rejectUser", () => {
    test("should reject pending user with reason", async () => {
      // Create pending user
      const pendingUser = await User.create({
        email: "toreject@test.com",
        password_hash: "TestPassword123!",
        role: "student",
        status: "pending",
      });

      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        params: { id: pendingUser._id.toString() },
        body: { reason: "Incomplete profile" },
      });
      const res = mockResponse();

      await userController.rejectUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);

      // Verify status changed
      const updatedUser = await User.findById(pendingUser._id);
      expect(updatedUser.status).toBe("rejected");
    }, 15000);
  });

  describe("setUserStatus", () => {
    test("should activate user", async () => {
      // Create inactive user
      const inactiveUser = await User.create({
        email: "inactive@test.com",
        password_hash: "TestPassword123!",
        role: "student",
        status: "approved",
        is_active: false,
      });

      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        params: { id: inactiveUser._id.toString() },
        body: { is_active: true },
      });
      const res = mockResponse();

      await userController.setUserStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);

      // Verify status changed
      const updatedUser = await User.findById(inactiveUser._id);
      expect(updatedUser.is_active).toBe(true);
    }, 15000);

    test("should deactivate user", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        params: { id: studentUser._id.toString() },
        body: { is_active: false },
      });
      const res = mockResponse();

      await userController.setUserStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);

      // Restore for other tests
      await User.findByIdAndUpdate(studentUser._id, { is_active: true });
    }, 15000);

    test("should return 400 for invalid is_active value", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        params: { id: studentUser._id.toString() },
        body: { is_active: "invalid" },
      });
      const res = mockResponse();

      await userController.setUserStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    }, 15000);
  });

  describe("restoreUser", () => {
    test("should restore soft-deleted user", async () => {
      // Create and soft delete a user
      const userToRestore = await User.create({
        email: "restore@test.com",
        password_hash: "TestPassword123!",
        role: "student",
        status: "approved",
      });
      await User.findByIdAndUpdate(userToRestore._id, {
        deleted_at: new Date(),
      });

      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        params: { id: userToRestore._id.toString() },
      });
      const res = mockResponse();

      await userController.restoreUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);

      // Verify user is restored
      const restoredUser = await User.findById(userToRestore._id);
      expect(restoredUser.deleted_at).toBeNull();
    }, 15000);
  });

  describe("forceDeleteUser", () => {
    test("should permanently delete user", async () => {
      // Create a user to force delete
      const userToForceDelete = await User.create({
        email: "forcedelete@test.com",
        password_hash: "TestPassword123!",
        role: "student",
        status: "approved",
      });

      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        params: { id: userToForceDelete._id.toString() },
      });
      const res = mockResponse();

      await userController.forceDeleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);

      // Verify user is permanently deleted
      const deletedUser = await User.findById(userToForceDelete._id);
      expect(deletedUser).toBeNull();
    }, 15000);
  });

  // ========================================
  // 4. BULK OPERATIONS TESTS
  // ========================================

  describe("bulkApproveUsers", () => {
    test("should approve multiple users at once", async () => {
      // Create pending users
      const user1 = await User.create({
        email: "bulk1@test.com",
        password_hash: "TestPassword123!",
        role: "student",
        status: "pending",
      });
      const user2 = await User.create({
        email: "bulk2@test.com",
        password_hash: "TestPassword123!",
        role: "student",
        status: "pending",
      });

      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        body: { userIds: [user1._id.toString(), user2._id.toString()] },
      });
      const res = mockResponse();

      await userController.bulkApproveUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);

      // Verify all users approved
      const approvedUser1 = await User.findById(user1._id);
      const approvedUser2 = await User.findById(user2._id);
      expect(approvedUser1.status).toBe("approved");
      expect(approvedUser2.status).toBe("approved");
    }, 15000);

    test("should return 400 for invalid userIds array", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        body: { userIds: "not-an-array" },
      });
      const res = mockResponse();

      await userController.bulkApproveUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    }, 15000);

    test("should return 400 for empty userIds array", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        body: { userIds: [] },
      });
      const res = mockResponse();

      await userController.bulkApproveUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    }, 15000);
  });

  // ========================================
  // 5. SEARCH & FILTER TESTS
  // ========================================

  describe("searchUsers", () => {
    test("should search users by search term", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        query: { q: "student", page: "1", limit: "10" },
      });
      const res = mockResponse();

      await userController.searchUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
    }, 15000);

    test("should return 400 for search term less than 2 characters", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        query: { q: "a", page: "1", limit: "10" },
      });
      const res = mockResponse();

      await userController.searchUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(false);
    }, 15000);

    test("should return 400 for missing search term", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        query: { page: "1", limit: "10" },
      });
      const res = mockResponse();

      await userController.searchUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    }, 15000);
  });

  describe("getEligibleUsers", () => {
    test("should get all eligible users", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
      });
      const res = mockResponse();

      await userController.getEligibleUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
    }, 15000);
  });

  // ========================================
  // 6. ANALYTICS TESTS
  // ========================================

  describe("getUserStats", () => {
    test("should get user statistics as admin", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        params: { id: studentUser._id.toString() },
      });
      const res = mockResponse();

      await userController.getUserStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
    }, 15000);

    test("should allow user to get own statistics", async () => {
      const req = mockRequest({
        user: { _id: studentUser._id.toString(), role: "student" },
        params: { id: studentUser._id.toString() },
      });
      const res = mockResponse();

      await userController.getUserStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    }, 15000);

    test("should forbid non-admin from accessing other user statistics", async () => {
      const req = mockRequest({
        user: { _id: studentUser._id.toString(), role: "student" },
        params: { id: companyUser._id.toString() },
      });
      const res = mockResponse();

      await userController.getUserStats(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(false);
    }, 15000);
  });

  // ========================================
  // 7. EDGE CASES & ERROR HANDLING
  // ========================================

  describe("Edge Cases", () => {
    test("should handle pagination with invalid page number", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        query: { page: "invalid", limit: "10" },
      });
      const res = mockResponse();

      await userController.listUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      // Should default to page 1
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.metadata.page).toBe(1);
    }, 15000);

    test("should handle pagination with limit exceeding max", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        query: { page: "1", limit: "1000" }, // Exceeds max of 100
      });
      const res = mockResponse();

      await userController.listUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      // Should cap at max limit (100)
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.metadata.limit).toBeLessThanOrEqual(100);
    }, 15000);

    test("should handle empty sort parameter", async () => {
      const req = mockRequest({
        user: { _id: adminUser._id, role: "admin" },
        query: { page: "1", limit: "10", sort: "" },
      });
      const res = mockResponse();

      await userController.listUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    }, 15000);
  });
});
