import prisma from '../config/prisma.js';

export async function createSession(req, res, next) {
  try {
    const { emergencyType, severity, description, latitude, longitude } = req.body;
    const userId = req.userId || null; // Can be null for guests

    if (!emergencyType || !severity || !description) {
      return res.status(400).json({ error: "Fields 'emergencyType', 'severity', and 'description' are required." });
    }

    const session = await prisma.emergencySession.create({
      data: {
        userId,
        emergencyType,
        severity,
        description,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
      }
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
}

export async function getSessions(req, res, next) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required to retrieve session history." });
    }

    const sessions = await prisma.emergencySession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(sessions);
  } catch (error) {
    next(error);
  }
}

export async function deleteSession(req, res, next) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required to delete a session." });
    }

    // Verify session belongs to user
    const session = await prisma.emergencySession.findFirst({
      where: { id, userId }
    });

    if (!session) {
      return res.status(404).json({ error: "Emergency session not found or unauthorized access." });
    }

    await prisma.emergencySession.delete({
      where: { id }
    });

    res.json({ message: "Emergency session deleted successfully." });
  } catch (error) {
    next(error);
  }
}

export async function clearAllSessions(req, res, next) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required to clear history." });
    }

    await prisma.emergencySession.deleteMany({
      where: { userId }
    });

    res.json({ message: "All emergency history cleared successfully." });
  } catch (error) {
    next(error);
  }
}
