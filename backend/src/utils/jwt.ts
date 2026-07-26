import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export const generateAccessToken = (userId: mongoose.Types.ObjectId | string): string => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET || 'secret', {
    expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '15m') as any,
  });
};

export const generateRefreshToken = (userId: mongoose.Types.ObjectId | string): string => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', {
    expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any,
  });
};

export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret');
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
  } catch (error) {
    return null;
  }
};
