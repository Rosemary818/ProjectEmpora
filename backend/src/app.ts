import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import leaveRoutes from "./routes/leave.routes";
import attendanceRoutes from "./routes/attendance.routes";
import taskRoutes from "./routes/task.routes";
import timesheetRoutes from "./routes/timesheet.routes";
import adminRoutes from "./routes/admin.routes";
import projectRoutes from "./routes/project.routes";
import documentRoutes from "./routes/document.routes";
import announcementRoutes from "./routes/announcement.routes";
import notificationRoutes from './routes/notification.routes';
import eventRoutes from './routes/event.routes';
import feedbackRoutes from './routes/feedback.routes';
import holidayRoutes from "./routes/holiday.routes";
import calendarRoutes from "./routes/calendar.routes";
import referralRoutes from "./routes/referral.routes";
import departmentRoutes from "./routes/department.routes";
import designationRoutes from "./routes/designation.routes";
import skillRoutes from "./routes/skill.routes";
import certificationRoutes from "./routes/certification.routes";
import reportsRoutes from "./routes/reports.routes";
import jobRoutes from "./routes/job.routes";
import careerPortalRoutes from './routes/careerPortal.routes';
import interviewRoutes from "./routes/interview.routes";
import resumeRoutes from './routes/resume.routes';
import complaintRoutes from './routes/complaint.routes';
import trainingRoutes from './routes/training.routes';
import searchRoutes from './routes/search.routes';
import internalMobilityRoutes from "./routes/internalMobility.routes";
import salaryRoutes from "./routes/salary.routes";
import payslipRoutes from "./routes/payslip.routes";
import assetRoutes from "./routes/asset.routes";
import exitRoutes from "./routes/exitRequest.routes";
import serviceRequestRoutes from "./routes/serviceRequest.routes";
import serviceHistoryRoutes from "./routes/serviceHistory.routes";
import activityRoutes from "./routes/activity.routes";
import goalRoutes from "./routes/goal.routes";
import workloadRoutes from "./routes/workload.routes";
import policyRoutes from "./routes/policy.routes";
import { errorHandler } from "./middlewares/error.middleware";
import { initAttendanceCronJobs } from "./jobs/attendance.cron";
import { initGoalCronJobs } from "./jobs/goal.cron";
import { initProjectCronJobs } from "./jobs/project.cron";
import { initPromotionCronJobs } from "./jobs/promotion.cron";
import roomBookingRoutes from "./routes/roomBooking.routes";
import visitorRoutes from "./routes/visitor.routes";
import travelRequestRoutes from "./routes/travelRequest.routes";
import chatbotRoutes from "./routes/chatbot.routes";
import benchRoutes from "./routes/bench.routes";
import promotionRoutes from "./routes/promotion.routes";
import wfhRoutes from "./routes/wfh.routes";
import approvalInboxRoutes from "./routes/approvalInbox.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/timesheets", timesheetRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/certifications", certificationRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/internal-mobility", internalMobilityRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/payslips", payslipRoutes);
app.use('/api/career-portal', careerPortalRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/exits", exitRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/service-history", serviceHistoryRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/workloads", workloadRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/rooms", roomBookingRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/travel", travelRequestRoutes);
app.use("/api/chat", chatbotRoutes);
app.use("/api/bench", benchRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/wfh", wfhRoutes);
app.use("/api/approvals/inbox", approvalInboxRoutes);

app.use(errorHandler);

// Connect to MongoDB Atlas before starting server
connectDB().then(() => {
  initAttendanceCronJobs();
  initGoalCronJobs();
  initProjectCronJobs();
  initPromotionCronJobs();

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error("❌ Failed to start server due to DB connection error:", error);
});