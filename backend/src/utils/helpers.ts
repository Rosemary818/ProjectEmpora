import crypto from 'crypto';
import bcrypt from 'bcrypt';

export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const hashData = async (data: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(data, salt);
};

export const verifyHashedData = async (data: string, hashedData: string): Promise<boolean> => {
  return await bcrypt.compare(data, hashedData);
};
