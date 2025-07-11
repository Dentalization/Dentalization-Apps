const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateToken, generateRefreshToken } = require('../middleware/auth');

const prisma = new PrismaClient();

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { email, password, role, firstName, lastName, ...additionalData } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user with profile in a transaction
      const result = await prisma.$transaction(async (prisma) => {
        // Create user
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role,
          },
        });

        // Create role-specific profile
        if (role === 'PATIENT') {
          await prisma.patientProfile.create({
            data: {
              userId: user.id,
              firstName,
              lastName,
              ...additionalData,
            },
          });
        } else if (role === 'DOCTOR') {
          await prisma.doctorProfile.create({
            data: {
              userId: user.id,
              firstName,
              lastName,
              ...additionalData,
            },
          });
        }

        return user;
      });

      // Generate tokens
      const token = generateToken(result.id, result.role);
      const refreshToken = generateRefreshToken(result.id);

      // Store refresh token in database
      await prisma.session.create({
        data: {
          userId: result.id,
          refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: result.id,
            email: result.email,
            role: result.role,
            status: result.status,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration',
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user with profile data
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          patientProfile: true,
          doctorProfile: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check user status
      if (user.status !== 'ACTIVE') {
        return res.status(401).json({
          success: false,
          message: 'Account is not active. Please contact support.',
        });
      }

      // Generate tokens
      const token = generateToken(user.id, user.role);
      const refreshToken = generateRefreshToken(user.id);

      // Store refresh token
      await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      // Prepare user data
      const userData = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile: user.patientProfile || user.doctorProfile || null,
      };

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userData,
          token,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login',
      });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      // Find session with refresh token
      const session = await prisma.session.findFirst({
        where: {
          refreshToken,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token',
        });
      }

      // Generate new tokens
      const newToken = generateToken(session.user.id, session.user.role);
      const newRefreshToken = generateRefreshToken(session.user.id);

      // Update session with new refresh token
      await prisma.session.update({
        where: { id: session.id },
        data: {
          refreshToken: newRefreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during token refresh',
      });
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Delete the specific session
        await prisma.session.deleteMany({
          where: {
            refreshToken,
          },
        });
      }

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout',
      });
    }
  }

  // Logout from all devices
  async logoutAll(req, res) {
    try {
      const userId = req.user.id;

      // Delete all sessions for the user
      await prisma.session.deleteMany({
        where: {
          userId,
        },
      });

      res.json({
        success: true,
        message: 'Logged out from all devices successfully',
      });
    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout',
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          patientProfile: true,
          doctorProfile: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const userData = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile: user.patientProfile || user.doctorProfile || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      res.json({
        success: true,
        data: userData,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching profile',
      });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      // Optional: Logout from all devices except current
      await prisma.session.deleteMany({
        where: {
          userId,
          // Keep current session if you want
        },
      });

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while changing password',
      });
    }
  }
}

module.exports = new AuthController();
