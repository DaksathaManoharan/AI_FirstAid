import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { userService } from '../services/userService.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-12345';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export async function register(req, res, next) {
  try {
    const { name, email, password, preferredLanguage } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields (name, email, password) are required." });
    }

    const existingUser = await userService.findByEmail(email);

    if (existingUser && existingUser.passwordHash) {
      return res.status(409).json({ error: "Email is already registered. Please login or reset password." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await userService.create({
      name,
      email,
      passwordHash,
      preferredLanguage: preferredLanguage || "en"
    });

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        preferredLanguage: newUser.preferredLanguage,
        preferences: newUser.preferences
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await userService.findByEmail(email);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email address is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    // Generate cryptographically secure token and 6-digit OTP code
    const resetToken = crypto.randomBytes(24).toString('hex');
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    // Save token to user profile (or create placeholder if not yet registered)
    await userService.setResetToken(normalizedEmail, {
      resetToken,
      resetOtp: otpCode,
      resetExpires
    });

    const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // Send email
    const emailResult = await sendPasswordResetEmail({
      to: normalizedEmail,
      resetToken,
      otpCode,
      name: normalizedEmail.split('@')[0],
      resetUrl
    });

    res.json({
      success: true,
      message: `Password reset link and verification code have been sent to ${normalizedEmail}.`,
      email: normalizedEmail,
      mode: emailResult.mode,
      devOtp: process.env.NODE_ENV !== 'production' || emailResult.mode !== 'smtp' ? otpCode : undefined,
      resetUrl: process.env.NODE_ENV !== 'production' || emailResult.mode !== 'smtp' ? resetUrl : undefined
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyResetCode(req, res, next) {
  try {
    const { email, code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Verification code is required." });
    }

    const check = await userService.findByResetTokenOrOtp(email, code);

    if (!check) {
      return res.status(400).json({ error: "Invalid verification code or link." });
    }

    if (check.expired) {
      return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
    }

    res.json({
      success: true,
      message: "Verification code is valid."
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, tokenOrOtp, newPassword } = req.body;

    if (!tokenOrOtp || !newPassword) {
      return res.status(400).json({ error: "Verification code and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }

    const check = await userService.findByResetTokenOrOtp(email, tokenOrOtp);

    if (!check) {
      return res.status(400).json({ error: "Invalid or expired verification code." });
    }

    if (check.expired) {
      return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
    }

    const user = check.user;
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await userService.updatePassword(user.email, newPasswordHash);

    res.json({
      success: true,
      message: "Your password has been successfully reset! You can now log in with your new password."
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  res.json({ message: "Logout successful." });
}

export async function getPreferences(req, res, next) {
  try {
    const userId = req.userId;
    const prefs = await userService.getPreferences(userId);
    
    if (!prefs) {
      return res.status(404).json({ error: "Preferences not found." });
    }
    
    res.json(prefs);
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(req, res, next) {
  try {
    const userId = req.userId;
    const updated = await userService.updatePreferences(userId, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const userId = req.userId;
    await userService.deleteAccount(userId);
    res.json({ message: "Account successfully deleted." });
  } catch (error) {
    next(error);
  }
}
