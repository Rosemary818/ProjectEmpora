import mongoose from 'mongoose';
import { Interview } from './src/models/interview.model';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/empora')
  .then(async () => {
    try {
      await Interview.create({
        applicationId: new mongoose.Types.ObjectId(),
        candidateId: new mongoose.Types.ObjectId(),
        jobId: new mongoose.Types.ObjectId(),
        round: 'HR Round',
        interviewType: 'Online',
        date: new Date(),
        startTime: '10:00',
        endTime: '11:00',
        interviewer: 'John Doe',
        interviewerId: new mongoose.Types.ObjectId(),
        // omitting meetingLink to trigger validation error
      });
      console.log('Created successfully');
    } catch (e: any) {
      console.error('CAUGHT ERROR:', e.message);
    }
    process.exit(0);
  });
