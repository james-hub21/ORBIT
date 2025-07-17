import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { sessionService } from "./services/sessionService";
import { emailService } from "./services/emailService";
import { insertFacilityBookingSchema, insertTimeExtensionRequestSchema, insertOrzSessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ORZ Computer Usage Routes
  app.post('/api/orz/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { stationId } = req.body;

      if (!stationId) {
        return res.status(400).json({ message: "Station ID is required" });
      }

      const session = await sessionService.startSession(userId, stationId);
      res.json(session);
    } catch (error) {
      console.error("Error starting session:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get('/api/orz/sessions/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const session = await storage.getActiveOrzSession(userId);
      res.json(session);
    } catch (error) {
      console.error("Error fetching active session:", error);
      res.status(500).json({ message: "Failed to fetch active session" });
    }
  });

  app.post('/api/orz/sessions/:sessionId/activity', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      await sessionService.updateActivity(sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating activity:", error);
      res.status(500).json({ message: "Failed to update activity" });
    }
  });

  app.post('/api/orz/sessions/:sessionId/end', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      await sessionService.endSession(sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error ending session:", error);
      res.status(500).json({ message: "Failed to end session" });
    }
  });

  app.get('/api/orz/sessions/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getOrzSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching session history:", error);
      res.status(500).json({ message: "Failed to fetch session history" });
    }
  });

  // Time Extension Routes
  app.post('/api/orz/time-extension', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertTimeExtensionRequestSchema.parse(req.body);
      
      const request = await storage.createTimeExtensionRequest({
        ...data,
        userId,
      });
      
      res.json(request);
    } catch (error) {
      console.error("Error creating time extension request:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get('/api/orz/time-extension/pending', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const requests = await storage.getPendingTimeExtensionRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      res.status(500).json({ message: "Failed to fetch pending requests" });
    }
  });

  app.post('/api/orz/time-extension/:requestId/approve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { requestId } = req.params;
      const { adminResponse } = req.body;

      const request = await storage.getTimeExtensionRequest(requestId);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      await storage.updateTimeExtensionRequest(requestId, {
        status: 'approved',
        adminId: user.id,
        adminResponse,
      });

      // Extend the session
      await sessionService.extendSession(request.sessionId, request.requestedMinutes);

      // Send email notification
      const requestUser = await storage.getUser(request.userId);
      if (requestUser?.email) {
        await emailService.sendTimeExtensionResponse(request, requestUser);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error approving time extension:", error);
      res.status(500).json({ message: "Failed to approve time extension" });
    }
  });

  app.post('/api/orz/time-extension/:requestId/deny', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { requestId } = req.params;
      const { adminResponse } = req.body;

      const request = await storage.getTimeExtensionRequest(requestId);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      await storage.updateTimeExtensionRequest(requestId, {
        status: 'denied',
        adminId: user.id,
        adminResponse,
      });

      // Send email notification
      const requestUser = await storage.getUser(request.userId);
      if (requestUser?.email) {
        await emailService.sendTimeExtensionResponse(request, requestUser);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error denying time extension:", error);
      res.status(500).json({ message: "Failed to deny time extension" });
    }
  });

  // Computer Station Routes
  app.get('/api/orz/stations', isAuthenticated, async (req, res) => {
    try {
      const stations = await storage.getAllComputerStations();
      res.json(stations);
    } catch (error) {
      console.error("Error fetching stations:", error);
      res.status(500).json({ message: "Failed to fetch stations" });
    }
  });

  // Facility Routes
  app.get('/api/facilities', isAuthenticated, async (req, res) => {
    try {
      const facilities = await storage.getAllFacilities();
      res.json(facilities);
    } catch (error) {
      console.error("Error fetching facilities:", error);
      res.status(500).json({ message: "Failed to fetch facilities" });
    }
  });

  // Facility Booking Routes
  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertFacilityBookingSchema.parse(req.body);
      
      const booking = await storage.createFacilityBooking({
        ...data,
        userId,
      });

      // Send confirmation email
      const user = await storage.getUser(userId);
      const facility = await storage.getFacility(data.facilityId);
      
      if (user?.email && facility) {
        await emailService.sendBookingConfirmation(booking, user, facility.name);
      }

      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getFacilityBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/pending', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const bookings = await storage.getPendingFacilityBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching pending bookings:", error);
      res.status(500).json({ message: "Failed to fetch pending bookings" });
    }
  });

  app.post('/api/bookings/:bookingId/approve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { bookingId } = req.params;
      const { adminResponse } = req.body;

      const booking = await storage.getFacilityBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      await storage.updateFacilityBooking(bookingId, {
        status: 'approved',
        adminId: user.id,
        adminResponse,
      });

      // Send email notification
      const bookingUser = await storage.getUser(booking.userId);
      const facility = await storage.getFacility(booking.facilityId);
      
      if (bookingUser?.email && facility) {
        await emailService.sendBookingStatusUpdate(booking, bookingUser, facility.name);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error approving booking:", error);
      res.status(500).json({ message: "Failed to approve booking" });
    }
  });

  app.post('/api/bookings/:bookingId/deny', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { bookingId } = req.params;
      const { adminResponse } = req.body;

      const booking = await storage.getFacilityBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      await storage.updateFacilityBooking(bookingId, {
        status: 'denied',
        adminId: user.id,
        adminResponse,
      });

      // Send email notification
      const bookingUser = await storage.getUser(booking.userId);
      const facility = await storage.getFacility(booking.facilityId);
      
      if (bookingUser?.email && facility) {
        await emailService.sendBookingStatusUpdate(booking, bookingUser, facility.name);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error denying booking:", error);
      res.status(500).json({ message: "Failed to deny booking" });
    }
  });

  // Admin Dashboard Routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const sessions = await storage.getAllActiveSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching admin sessions:", error);
      res.status(500).json({ message: "Failed to fetch admin sessions" });
    }
  });

  app.get('/api/admin/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const alerts = await storage.getSystemAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.get('/api/admin/activity', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const activities = await storage.getActivityLogs();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
