import bcrypt from 'bcrypt';
import { sendEmail } from '../utils/email';
import { IUser } from '../models/user.model';

export class ConversionService {
  /**
   * Sets up credentials and welcome email for a newly converted (or newly created) employee.
   * This modifies the user object, but does NOT call `user.save()`. The caller is responsible for saving.
   * @param user The Mongoose User document
   * @returns tempPassword and emailSent status
   */
  static async setupEmployeeCredentialsAndEmail(user: IUser): Promise<{ tempPassword: string; emailSent: boolean }> {
    const tempPassword = Math.random().toString(36).slice(-8); // Random 8 chars
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    user.role = 'Employee';
    user.password = hashedPassword;
    user.mustChangePassword = true;
    user.status = 'Active'; // Ensure they are active

    const emailSent = await this.sendWelcomeEmail(user.email, user.firstName, tempPassword);

    return { tempPassword, emailSent };
  }

  /**
   * Regenerates a temporary password and resends the welcome email.
   * Modifies the user object, but does NOT call `user.save()`. The caller is responsible for saving.
   * @param user The Mongoose User document
   * @returns emailSent status
   */
  static async regeneratePasswordAndResendEmail(user: IUser): Promise<boolean> {
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    user.password = hashedPassword;
    user.mustChangePassword = true;

    return await this.sendWelcomeEmail(user.email, user.firstName, tempPassword);
  }

  private static async sendWelcomeEmail(email: string, firstName: string, tempPassword: string): Promise<boolean> {
    const loginUrl = 'http://localhost:5173/login'; // Adjust based on frontend URL
    const emailSubject = 'Welcome to Empora - Employee Account Created';
    const emailBody = `
      <p>Hello ${firstName},</p>
      <p>Congratulations!</p>
      <p>Your application with Empora has been successfully converted into an employee account.</p>
      <p>Your employee login credentials are:</p>
      <p><strong>Email:</strong> ${email}<br/>
      <strong>Temporary Password:</strong> ${tempPassword}<br/>
      <strong>Login:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
      <p>For security reasons, you will be required to change your password when you first log in.</p>
      <p>Please do not share your credentials with anyone.</p>
      <p>Regards,<br/>Empora HR Team</p>
    `;

    return await sendEmail(email, emailSubject, emailBody);
  }
}
