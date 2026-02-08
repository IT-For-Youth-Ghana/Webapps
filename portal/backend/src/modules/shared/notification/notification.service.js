/**
 * Notification Service
 * Handles in-app notifications
 */

import Notification from '../../notification/notification.model.js';
import logger from '../../../utils/logger.js';
import { emitToUser } from '../../../realtime/socket.js';

class NotificationService {
    /**
     * Create a notification
     */
    async create({ userId, type, title, message, link = null, metadata = {} }) {
        try {
            const notification = await Notification.create({
                userId,
                type,
                title,
                message,
                link,
                metadata,
            });

            logger.info(`Notification created for user ${userId}`, { type, title });
            emitToUser(userId, "notification:new", notification.toJSON());

            return notification;
        } catch (error) {
            logger.error(`Failed to create notification for user ${userId}`, error);
            throw error;
        }
    }

    /**
     * Create enrollment success notification
     */
    async notifyEnrollmentSuccess(userId, course) {
        return await this.create({
            userId,
            type: 'enrollment_success',
            title: `Welcome to ${course.title}!`,
            message: `You've been successfully enrolled in ${course.title}. Start learning now!`,
            link: `/courses/${course.id}`,
            metadata: { courseId: course.id },
        });
    }

    /**
     * Create course completion notification
     */
    async notifyCourseCompletion(userId, course) {
        return await this.create({
            userId,
            type: 'course_completed',
            title: 'Congratulations! 🎉',
            message: `You've completed ${course.title}. Your certificate is ready!`,
            link: `/certificates?course=${course.id}`,
            metadata: { courseId: course.id },
        });
    }

    /**
     * Create payment success notification
     */
    async notifyPaymentSuccess(userId, amount, currency, courseName) {
        return await this.create({
            userId,
            type: 'payment_success',
            title: 'Payment Successful',
            message: `Your payment of ${currency} ${amount} for ${courseName} was successful.`,
            link: '/payments',
        });
    }

    /**
     * Get unread count for user
     */
    async getUnreadCount(userId) {
        return await Notification.count({
            where: { userId, isRead: false },
        });
    }

    /**
     * Mark all as read for user
     */
    async markAllAsRead(userId) {
        await Notification.update(
            { isRead: true, readAt: new Date() },
            { where: { userId, isRead: false } }
        );

        return { success: true };
    }
}

export default new NotificationService();
