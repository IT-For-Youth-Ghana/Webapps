/**
 * Reusable OpenAPI Component Schemas
 * These schemas are referenced throughout the API documentation
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: User ID
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         firstName:
 *           type: string
 *           description: User first name
 *         lastName:
 *           type: string
 *           description: User last name
 *         phone:
 *           type: string
 *           description: User phone number
 *         role:
 *           type: string
 *           enum: [student, teacher, admin]
 *           description: User role
 *         status:
 *           type: string
 *           enum: [pending, active, suspended]
 *           description: User account status
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Date of birth
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     Course:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *           description: Course title
 *         description:
 *           type: string
 *           description: Course description
 *         category:
 *           type: string
 *           description: Course category
 *         level:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         duration:
 *           type: integer
 *           description: Duration in weeks
 *         price:
 *           type: number
 *           format: decimal
 *           description: Course price
 *         currency:
 *           type: string
 *           default: GHS
 *         moodleCourseId:
 *           type: integer
 *           description: Moodle course ID
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     Enrollment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         courseId:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [pending, active, completed, dropped]
 *         progress:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Course completion percentage
 *         enrolledAt:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         enrollmentId:
 *           type: string
 *           format: uuid
 *         courseId:
 *           type: string
 *           format: uuid
 *         amount:
 *           type: number
 *           format: decimal
 *         currency:
 *           type: string
 *           default: GHS
 *         status:
 *           type: string
 *           enum: [pending, success, failed, cancelled]
 *         paystackReference:
 *           type: string
 *           description: Paystack transaction reference
 *         paymentMethod:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum: [enrollment, payment, course_update, system]
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         isRead:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Operation completed successfully
 *         data:
 *           type: object
 *           description: Response data
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: An error occurred
 *         error:
 *           type: string
 *           description: Error details
 *         statusCode:
 *           type: integer
 *           example: 400
 * 
 *     PaginationInfo:
 *       type: object
 *       properties:
 *         currentPage:
 *           type: integer
 *           example: 1
 *         totalPages:
 *           type: integer
 *           example: 5
 *         totalItems:
 *           type: integer
 *           example: 50
 *         itemsPerPage:
 *           type: integer
 *           example: 10
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Enter your JWT token obtained from /api/auth/login
 */

export default {};
