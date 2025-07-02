const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Verify JWT token and attach user to request
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user with profile data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.',
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

// Check if user has required role(s)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (user && user.status === 'ACTIVE') {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { 
      userId, 
      role,
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  generateToken,
  generateRefreshToken,
};
