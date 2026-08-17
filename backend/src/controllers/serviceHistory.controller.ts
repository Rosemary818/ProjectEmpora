import { Request, Response } from 'express';
import { Complaint } from '../models/complaint.model';
import { ServiceRequest } from '../models/serviceRequest.model';
import { Feedback } from '../models/feedback.model';

export const getServiceHistory = async (req: Request, res: Response) => {
  try {
    const employeeId = (req as any).user._id;

    const complaints = await Complaint.find({ employeeId }).sort({ createdAt: -1 });
    const serviceRequests = await ServiceRequest.find({ employeeId }).sort({ createdAt: -1 });

    const feedbacks = await Feedback.find({ 
      requesterId: employeeId,
      requestType: { $in: ['Complaint', 'ServiceRequest'] }
    });

    const feedbackMap = new Map();
    feedbacks.forEach(f => {
      feedbackMap.set(f.requestId.toString(), f);
    });

    const historyItems: any[] = [];

    complaints.forEach(c => {
      historyItems.push({
        _id: c._id,
        id: c.complaintId,
        type: 'Complaint',
        title: c.subject,
        category: c.category,
        priority: null,
        status: c.status,
        createdAt: c.createdAt,
        rating: feedbackMap.has(c._id.toString()) ? feedbackMap.get(c._id.toString()).rating : null,
        originalData: c
      });
    });

    serviceRequests.forEach(sr => {
      historyItems.push({
        _id: sr._id,
        id: sr.requestId,
        type: 'Service Request',
        title: sr.title,
        category: sr.category,
        priority: sr.priority,
        status: sr.status,
        createdAt: sr.createdAt,
        rating: feedbackMap.has(sr._id.toString()) ? feedbackMap.get(sr._id.toString()).rating : null,
        originalData: sr
      });
    });

    // Sort by createdAt descending
    historyItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({ success: true, data: historyItems });
  } catch (error: any) {
    console.error('Error fetching service history:', error);
    res.status(500).json({ success: false, message: 'Server error fetching service history' });
  }
};
