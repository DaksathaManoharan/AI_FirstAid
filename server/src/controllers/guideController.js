import prisma from '../config/prisma.js';

export async function getGuides(req, res, next) {
  try {
    const guides = await prisma.emergencyGuide.findMany({
      orderBy: { type: 'asc' }
    });
    res.json(guides);
  } catch (error) {
    next(error);
  }
}

export async function getGuideByType(req, res, next) {
  try {
    const { type } = req.params;
    const guide = await prisma.emergencyGuide.findUnique({
      where: { type: type.toLowerCase() }
    });

    if (!guide) {
      return res.status(404).json({ error: `Emergency guide of type '${type}' not found.` });
    }

    res.json(guide);
  } catch (error) {
    next(error);
  }
}
