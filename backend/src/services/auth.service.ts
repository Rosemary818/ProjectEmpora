import { User } from '../models/user.model';
import { Otp } from '../models/otp.model';
import { Session } from '../models/session.model';
import { AppError } from '../utils/error';
import { hashData, verifyHashedData, generateOTP } from '../utils/helpers';
import { sendEmail } from '../utils/email';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export class AuthService {
  static async registerUser(name: string, email: string, password?: string) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        throw new AppError('User already exists', 400);
      }
      // If user exists but not verified, we can resend OTP or allow them to try again.
      // For simplicity, we'll just update the name/password and send a new OTP.
      existingUser.name = name;
      if (password) {
        existingUser.password = await hashData(password);
      }
      await existingUser.save();
    } else {
      let hashedPassword;
      if (password) {
        hashedPassword = await hashData(password);
      }
      
      await User.create({
        name,
        email,
        password: hashedPassword,
      });
    }

    const otp = generateOTP();
    const hashedOtp = await hashData(otp);
    
    // Clear old OTPs for this email and purpose
    await Otp.deleteMany({ email, purpose: 'VERIFY_EMAIL' });

    await Otp.create({
      email,
      otp: hashedOtp,
      purpose: 'VERIFY_EMAIL',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
    });

    // Send email
    await sendEmail(
      email,
      'Verify Your Email',
      `<p>Your OTP for email verification is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`
    );
  }

  static async verifyEmail(email: string, otp: string) {
    const otpRecord = await Otp.findOne({ email, purpose: 'VERIFY_EMAIL' });
    if (!otpRecord) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    const isValid = await verifyHashedData(otp, otpRecord.otp);
    if (!isValid) {
      throw new AppError('Invalid OTP', 400);
    }

    await User.findOneAndUpdate({ email }, { isEmailVerified: true });
    await Otp.deleteMany({ email, purpose: 'VERIFY_EMAIL' });
  }

  static async login(email: string, password?: string, ipAddress?: string, userAgent?: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isEmailVerified) {
      throw new AppError('Please verify your email first', 401);
    }

    if (password && user.password) {
      const isMatch = await verifyHashedData(password, user.password);
      if (!isMatch) {
        throw new AppError('Invalid credentials', 401);
      }
    } else if (password && !user.password) {
      throw new AppError('Password not set for this user', 401);
    }

    const accessToken = generateAccessToken(user._id as string);
    const refreshToken = generateRefreshToken(user._id as string);
    
    const hashedRefreshToken = await hashData(refreshToken);

    await Session.create({
      userId: user._id,
      refreshToken: hashedRefreshToken,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return { user, accessToken, refreshToken };
  }

  static async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const otp = generateOTP();
    const hashedOtp = await hashData(otp);

    await Otp.deleteMany({ email, purpose: 'RESET_PASSWORD' });

    await Otp.create({
      email,
      otp: hashedOtp,
      purpose: 'RESET_PASSWORD',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendEmail(
      email,
      'Reset Your Password',
      `<p>Your OTP for password reset is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`
    );
  }

  static async resetPassword(email: string, otp: string, newPassword: string) {
    const otpRecord = await Otp.findOne({ email, purpose: 'RESET_PASSWORD' });
    if (!otpRecord) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    const isValid = await verifyHashedData(otp, otpRecord.otp);
    if (!isValid) {
      throw new AppError('Invalid OTP', 400);
    }

    const hashedPassword = await hashData(newPassword);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    await Otp.deleteMany({ email, purpose: 'RESET_PASSWORD' });
  }

  static async refreshToken(oldRefreshToken: string, ipAddress?: string, userAgent?: string) {
    // Find sessions that might match
    // Note: Since we hash the refresh token, we cannot directly query it if it's uniquely salted.
    // Wait, bcrypt genSalt(10) uses unique salts. So we can't findOne({ refreshToken: oldRefreshToken }).
    // To solve this, we should decode the oldRefreshToken to get the userId, then find the user's sessions
    // and verify the token against each session's hashed token.
    

    const decoded = verifyRefreshToken(oldRefreshToken);
    if (!decoded) {
      throw new AppError('Invalid refresh token', 401);
    }

    const sessions = await Session.find({ userId: decoded.userId });
    let currentSession = null;
    
    for (const session of sessions) {
      const isValid = await verifyHashedData(oldRefreshToken, session.refreshToken);
      if (isValid) {
        currentSession = session;
        break;
      }
    }

    if (!currentSession) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Issue new tokens
    const accessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);
    const hashedNewRefreshToken = await hashData(newRefreshToken);

    currentSession.refreshToken = hashedNewRefreshToken;
    currentSession.ipAddress = ipAddress;
    currentSession.userAgent = userAgent;
    currentSession.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await currentSession.save();

    return { accessToken, refreshToken: newRefreshToken };
  }

  static async logout(refreshToken: string) {

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) return;

    const sessions = await Session.find({ userId: decoded.userId });
    
    for (const session of sessions) {
      const isValid = await verifyHashedData(refreshToken, session.refreshToken);
      if (isValid) {
        await Session.findByIdAndDelete(session._id);
        break;
      }
    }
  }
}
