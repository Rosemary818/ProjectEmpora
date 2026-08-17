import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Policy } from './src/models/policy.model';
import { User } from './src/models/user.model';

dotenv.config();

const seedPolicies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB Connected');

    const adminUser = await User.findOne({ role: { $in: ['HRAdmin', 'SuperAdmin'] } });
    if (!adminUser) {
      console.log('No HR Admin or Super Admin found. Cannot seed policies.');
      process.exit(1);
    }

    const policies = [
      {
        title: 'Leave Policy',
        category: 'Leave',
        description: 'Guidelines regarding employee leave and eligibility.',
        content: '1. Annual Leave: Employees are entitled to 20 days of paid annual leave.\n2. Sick Leave: 10 days of paid sick leave per year. Medical certificate required for >3 consecutive days.\n3. Maternity/Paternity Leave: As per local regulations.\n4. Unpaid Leave: Requires managerial approval 2 weeks in advance.',
        status: 'Active',
        createdBy: adminUser._id
      },
      {
        title: 'Attendance Policy',
        category: 'Attendance',
        description: 'Company attendance and working-hour guidelines.',
        content: '1. Core Working Hours: 10:00 AM to 4:00 PM. Employees must be available during this time.\n2. Total Hours: 40 hours per week.\n3. Check-in/Check-out: Employees must use the Empora dashboard to log their daily attendance.\n4. Tardiness: More than 3 late check-ins per month will require a meeting with the manager.',
        status: 'Active',
        createdBy: adminUser._id
      },
      {
        title: 'Work From Home Policy',
        category: 'Work From Home',
        description: 'Guidelines for remote work.',
        content: '1. Eligibility: All full-time employees are eligible for up to 3 days of WFH per week.\n2. Equipment: Company will provide a laptop and monitor. Internet costs are covered up to $50/month.\n3. Communication: Must be online and responsive on Slack/Teams during working hours.\n4. Security: Must use company VPN when accessing internal networks from public Wi-Fi.',
        status: 'Active',
        createdBy: adminUser._id
      },
      {
        title: 'IT & Security Policy',
        category: 'IT & Security',
        description: 'Guidelines for using company IT resources.',
        content: '1. Passwords: Must be changed every 90 days and follow complexity requirements.\n2. Software: Only IT-approved software may be installed on company devices.\n3. Data Protection: Confidential company data must not be stored on personal devices or external drives.\n4. Incident Reporting: Any lost device or suspected security breach must be reported to IT immediately.',
        status: 'Active',
        createdBy: adminUser._id
      },
      {
        title: 'Code of Conduct',
        category: 'Code of Conduct',
        description: 'Expected behavior and professional standards.',
        content: '1. Respect: Treat all colleagues, clients, and partners with respect and professionalism.\n2. Harassment: Empora has a zero-tolerance policy for harassment or discrimination of any kind.\n3. Conflict of Interest: Employees must disclose any potential conflicts of interest to HR.\n4. Dress Code: Smart casual in the office; professional attire for client meetings.',
        status: 'Active',
        createdBy: adminUser._id
      },
      {
        title: 'Holiday Policy 2026',
        category: 'Holiday',
        description: 'List of observed public holidays for the current year.',
        content: 'Empora observes the following public holidays in 2026:\n- New Year\'s Day: Jan 1\n- Martin Luther King Jr. Day: Jan 19\n- Memorial Day: May 25\n- Independence Day: Jul 4\n- Labor Day: Sep 7\n- Thanksgiving Day: Nov 26 & 27\n- Christmas Day: Dec 25\n\nIf a holiday falls on a weekend, it will be observed on the closest Friday or Monday.',
        status: 'Inactive',
        createdBy: adminUser._id
      }
    ];

    await Policy.deleteMany({});
    console.log('Cleared existing policies');

    await Policy.insertMany(policies);
    console.log('Seeded policies successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding policies:', error);
    process.exit(1);
  }
};

seedPolicies();
