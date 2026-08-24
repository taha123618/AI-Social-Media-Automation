import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

/**
 * Socket.io Handler
 * Manages real-time connections and event emission for social posting updates
 * Uses a singleton pattern to prevent leaks during hot-reloads
 */

declare global {
  var io: SocketServer | undefined;
}

/**
 * Initialize Socket.io server
 */
export const initSocket = (server: HttpServer) => {
  if (global.io) {
    console.log('[SOCKET] Reusing existing SocketServer instance');
    return global.io;
  }

  console.log('[SOCKET] Initializing new SocketServer instance');
  
  const io = new SocketServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || '*',
      methods: ['GET', 'POST'],
    },
    // Add path explicitly to avoid collisions
    path: '/api/socket',
    addTrailingSlash: false,
  });

  io.on('connection', (socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);

    // Join a room for a specific post to receive granular updates
    socket.on('join-post-updates', (postId: string) => {
      socket.join(`post-${postId}`);
      console.log(`[SOCKET] Client ${socket.id} joined updates for post ${postId}`);
    });

    // Join a room for a specific draft's publishing status
    socket.on('join-publishing-status', (draftId: string) => {
      socket.join(`draft-${draftId}`);
      console.log(`[SOCKET] Client ${socket.id} joined publishing status for draft ${draftId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[SOCKET] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  global.io = io;
  return io;
};

/**
 * Get the initialized IO instance
 */
export const getIO = () => {
  return global.io;
};

/**
 * Emit a real-time update for a specific post
 */
export const emitPostUpdate = (postId: string, data: any) => {
  const io = global.io;
  if (io) {
    io.to(`post-${postId}`).emit('post-update', data);
    // Also emit a general update for dashboards
    io.emit('social-activity', { type: 'post_update', postId, ...data });
  }
};

/**
 * Emit real-time publishing status for a draft
 */
export const emitPublishingStatus = (draftId: string, status: {
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  message?: string;
  progress?: number;
  platform?: string;
}) => {
  const io = global.io;
  if (io) {
    io.to(`draft-${draftId}`).emit('publishing-status', status);
  }
};
