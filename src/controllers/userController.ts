import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User, UserCreateInput, UserLoginInput, UserResponse } from '../models/User';

// In-memory user storage (replace with database in production)
const users: User[] = [];

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Helper function to generate JWT
const generateToken = (user: User): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
};

// Helper function to exclude password from user response
const excludePassword = (user: User): UserResponse => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName }: UserCreateInput = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, password, firstName, and lastName are required'
      });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password too weak',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(newUser);

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: excludePassword(newUser),
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to register user'
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password }: UserLoginInput = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Update last login
    user.updatedAt = new Date();

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: excludePassword(user),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to login'
    });
  }
};

export const getUserProfile = (req: Request, res: Response) => {
  try {
    // User info is already available from auth middleware
    const userInfo = (req as any).user;
    
    // Find full user data
    const user = users.find(u => u.id === userInfo.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    res.json({
      user: excludePassword(user)
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user profile'
    });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userInfo = (req as any).user;
    const { firstName, lastName, email } = req.body;

    // Find user
    const userIndex = users.findIndex(u => u.id === userInfo.id);
    if (userIndex === -1) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    // Validate email if provided
    if (email && email !== users[userIndex].email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Invalid email format',
          message: 'Please provide a valid email address'
        });
      }

      // Check if email is already taken
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== userInfo.id);
      if (existingUser) {
        return res.status(409).json({
          error: 'Email already taken',
          message: 'This email is already in use by another user'
        });
      }
    }

    // Update user
    if (firstName !== undefined) users[userIndex].firstName = firstName.trim();
    if (lastName !== undefined) users[userIndex].lastName = lastName.trim();
    if (email !== undefined) users[userIndex].email = email.toLowerCase();
    users[userIndex].updatedAt = new Date();

    res.json({
      message: 'Profile updated successfully',
      user: excludePassword(users[userIndex])
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update profile'
    });
  }
};

// Get all users (admin only - for testing)
export const getAllUsers = (req: Request, res: Response) => {
  const usersWithoutPasswords = users.map(excludePassword);
  res.json({
    users: usersWithoutPasswords,
    total: users.length
  });
};
