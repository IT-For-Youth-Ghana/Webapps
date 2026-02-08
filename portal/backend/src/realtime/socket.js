/**
 * Realtime Socket Server
 * Manages websocket connections and user notification channels
 */

import { Server } from "socket.io";
import config from "../config/index.js";
import jwtUtil from "../modules/shared/auth/jwt.util.js";
import logger from "../utils/logger.js";

let io = null;

const getTokenFromHandshake = (socket) => {
    const authToken = socket.handshake?.auth?.token;
    if (authToken) return authToken;

    const header = socket.handshake?.headers?.authorization;
    if (header && header.startsWith("Bearer ")) {
        return header.replace("Bearer ", "");
    }

    const queryToken = socket.handshake?.query?.token;
    if (typeof queryToken === "string") return queryToken;

    return null;
};

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: config.cors.origins,
            credentials: true,
        },
    });

    io.use((socket, next) => {
        try {
            const token = getTokenFromHandshake(socket);
            if (!token) {
                return next(new Error("Unauthorized"));
            }

            const decoded = jwtUtil.verifyToken(token);
            if (!decoded?.id) {
                return next(new Error("Unauthorized"));
            }

            socket.data.userId = decoded.id;
            return next();
        } catch (error) {
            return next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.data.userId;
        const room = `user:${userId}`;
        socket.join(room);

        logger.info(`🔔 Socket connected: ${socket.id} (user ${userId})`);

        socket.on("disconnect", (reason) => {
            logger.info(`🔔 Socket disconnected: ${socket.id} (${reason})`);
        });
    });

    logger.info("🔌 Realtime socket server initialized");

    return io;
};

export const getIO = () => io;

export const emitToUser = (userId, event, payload) => {
    if (!io || !userId) return;
    io.to(`user:${userId}`).emit(event, payload);
};
