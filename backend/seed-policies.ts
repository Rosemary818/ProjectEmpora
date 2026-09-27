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
        content: `### Annual Leave Policy\n\n* Each eligible employee is entitled to a total of **20 regular leave days per leave year**.\n* The 20 days are divided into:\n\n  * **Earned / Annual Leave: 10 days per year**\n  * **Sick Leave: 6 days per year**\n  * **Casual Leave: 4 days per year**\n* Regular leave must be **credited quarterly**.\n* One quarter means a period of **3 months**, and there are 4 quarters in a year:\n\n  * Q1: January – March\n  * Q2: April – June\n  * Q3: July – September\n  * Q4: October – December\n* Quarterly credit should be:\n\n  * Earned / Annual Leave: **2.5 days per quarter**\n  * Sick Leave: **1.5 days per quarter**\n  * Casual Leave: **1 day per quarter**\n  * Total: **5 leave days per quarter**\n* Therefore, the total regular leave credited in one full year is **20 days**.\n* The system should automatically update the employee's leave balance when each quarter begins.\n* The leave balance should clearly display:\n\n  * Total allocated leave\n  * Used leave\n  * Remaining leave\n  * Leave type\n  * Current quarter\n* **Special leaves** such as Maternity Leave, Marriage Leave, Bereavement Leave, and Compensatory Off should be maintained separately and **must not be deducted from the 20 regular leave days**.\n* Do not change the existing UI design unnecessarily. Integrate this policy into the existing Leave Management module and maintain the current Empora design and functionality.`,
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
