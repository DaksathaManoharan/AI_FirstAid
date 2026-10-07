import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../config/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'usersStore.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load local users file
function loadLocalUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[UserService] Error reading local users file:', err.message);
  }
  return [];
}

// Save local users file
function saveLocalUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('[UserService] Error writing local users file:', err.message);
  }
}

// Helper to determine if Prisma is available
let prismaAvailable = true;

async function checkPrisma() {
  if (!prismaAvailable) return false;
  try {
    // Quick test query with timeout
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    prismaAvailable = false;
    console.warn('[UserService] Database connection unavailable. Using resilient local user storage.');
    return false;
  }
}

export const userService = {
  async findByEmail(email) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    
    // Try Prisma first
    if (prismaAvailable) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: { preferences: true }
        });
        if (user) return user;
      } catch (err) {
        prismaAvailable = false;
        console.warn('[UserService] Prisma findByEmail failed, falling back to local store:', err.message);
      }
    }

    // Fallback to local store
    const localUsers = loadLocalUsers();
    return localUsers.find(u => u.email.toLowerCase() === normalizedEmail) || null;
  },

  async findById(id) {
    if (prismaAvailable) {
      try {
        const user = await prisma.user.findUnique({
          where: { id },
          include: { preferences: true }
        });
        if (user) return user;
      } catch (err) {
        prismaAvailable = false;
      }
    }

    const localUsers = loadLocalUsers();
    return localUsers.find(u => u.id === id) || null;
  },

  async create({ name, email, passwordHash, preferredLanguage = 'en' }) {
    const normalizedEmail = email.trim().toLowerCase();

    if (prismaAvailable) {
      try {
        const newUser = await prisma.user.create({
          data: {
            name,
            email: normalizedEmail,
            passwordHash,
            preferredLanguage,
            preferences: {
              create: {
                language: preferredLanguage,
                theme: 'dark',
                voiceEnabled: true
              }
            }
          },
          include: { preferences: true }
        });
        return newUser;
      } catch (err) {
        prismaAvailable = false;
        console.warn('[UserService] Prisma create failed, falling back to local store:', err.message);
      }
    }

    // Local store creation
    const localUsers = loadLocalUsers();
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name,
      email: normalizedEmail,
      passwordHash,
      preferredLanguage,
      preferences: {
        language: preferredLanguage,
        theme: 'dark',
        voiceEnabled: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localUsers.push(newUser);
    saveLocalUsers(localUsers);
    return newUser;
  },

  async setResetToken(email, { resetToken, resetOtp, resetExpires }) {
    const normalizedEmail = email.trim().toLowerCase();

    // Check in local store and update
    const localUsers = loadLocalUsers();
    let userIndex = localUsers.findIndex(u => u.email.toLowerCase() === normalizedEmail);

    if (userIndex !== -1) {
      localUsers[userIndex].resetToken = resetToken;
      localUsers[userIndex].resetOtp = resetOtp;
      localUsers[userIndex].resetExpires = resetExpires;
      saveLocalUsers(localUsers);
      return localUsers[userIndex];
    } else {
      // If user doesn't exist yet, we can create an entry to allow them to set password
      const newUser = {
        id: 'usr_' + Date.now(),
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        passwordHash: '',
        preferredLanguage: 'en',
        resetToken,
        resetOtp,
        resetExpires,
        preferences: {
          language: 'en',
          theme: 'dark',
          voiceEnabled: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localUsers.push(newUser);
      saveLocalUsers(localUsers);
      return newUser;
    }
  },

  async findByResetTokenOrOtp(email, tokenOrOtp) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const trimmedInput = (tokenOrOtp || '').trim();

    const localUsers = loadLocalUsers();
    const user = localUsers.find(u => {
      const matchEmail = !normalizedEmail || u.email.toLowerCase() === normalizedEmail;
      const matchToken = u.resetToken && u.resetToken === trimmedInput;
      const matchOtp = u.resetOtp && u.resetOtp.toString() === trimmedInput;
      return matchEmail && (matchToken || matchOtp);
    });

    if (!user) return null;

    // Check expiration
    if (user.resetExpires && new Date(user.resetExpires) < new Date()) {
      return { expired: true, user };
    }

    return { expired: false, user };
  },

  async updatePassword(email, newPasswordHash) {
    const normalizedEmail = email.trim().toLowerCase();

    if (prismaAvailable) {
      try {
        await prisma.user.update({
          where: { email: normalizedEmail },
          data: { passwordHash: newPasswordHash }
        });
      } catch (err) {
        // Continue to local update
      }
    }

    const localUsers = loadLocalUsers();
    const userIndex = localUsers.findIndex(u => u.email.toLowerCase() === normalizedEmail);
    if (userIndex !== -1) {
      localUsers[userIndex].passwordHash = newPasswordHash;
      localUsers[userIndex].resetToken = null;
      localUsers[userIndex].resetOtp = null;
      localUsers[userIndex].resetExpires = null;
      localUsers[userIndex].updatedAt = new Date().toISOString();
      saveLocalUsers(localUsers);
      return localUsers[userIndex];
    }
    return null;
  },

  async getPreferences(userId) {
    if (prismaAvailable) {
      try {
        const prefs = await prisma.userPreference.findUnique({ where: { userId } });
        if (prefs) return prefs;
      } catch (err) {}
    }

    const localUsers = loadLocalUsers();
    const user = localUsers.find(u => u.id === userId);
    return user ? user.preferences : null;
  },

  async updatePreferences(userId, prefs) {
    if (prismaAvailable) {
      try {
        const updated = await prisma.userPreference.upsert({
          where: { userId },
          update: prefs,
          create: { userId, ...prefs }
        });
        return updated;
      } catch (err) {}
    }

    const localUsers = loadLocalUsers();
    const userIndex = localUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      localUsers[userIndex].preferences = {
        ...localUsers[userIndex].preferences,
        ...prefs
      };
      if (prefs.language) {
        localUsers[userIndex].preferredLanguage = prefs.language;
      }
      saveLocalUsers(localUsers);
      return localUsers[userIndex].preferences;
    }
    return prefs;
  },

  async deleteAccount(userId) {
    if (prismaAvailable) {
      try {
        await prisma.user.delete({ where: { id: userId } });
      } catch (err) {}
    }

    const localUsers = loadLocalUsers();
    const filtered = localUsers.filter(u => u.id !== userId);
    saveLocalUsers(filtered);
    return true;
  }
};
