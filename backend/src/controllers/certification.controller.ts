import { Request, Response } from 'express';
import { Certification } from '../models/certification.model';
import { AppError } from '../utils/error';

// Get employee's certifications
export const getEmployeeCertifications = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId || (req as any).user.id;
    
    const certifications = await Certification.find({ userId }).sort({ issueDate: -1 });
      
    res.status(200).json({ success: true, data: certifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add certification
export const addCertification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, issuingOrganization, issueDate, expiryDate, credentialId, credentialUrl } = req.body;
    
    let certificateFile = '';
    if (req.file) {
      certificateFile = `/uploads/${req.file.filename}`;
    }
    
    const certification = await Certification.create({
      userId,
      name,
      issuingOrganization,
      issueDate,
      expiryDate: expiryDate || undefined,
      credentialId,
      credentialUrl,
      certificateFile,
    });
    
    res.status(201).json({ success: true, data: certification });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Edit certification
export const updateCertification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { name, issuingOrganization, issueDate, expiryDate, credentialId, credentialUrl } = req.body;
    
    // Find first to check ownership
    const existingCert = await Certification.findOne({ _id: id, userId });
    if (!existingCert) {
      return res.status(404).json({ success: false, error: 'Certification not found' });
    }
    
    let certificateFile = existingCert.certificateFile;
    if (req.file) {
      certificateFile = `/uploads/${req.file.filename}`;
    }
    
    existingCert.name = name || existingCert.name;
    existingCert.issuingOrganization = issuingOrganization || existingCert.issuingOrganization;
    existingCert.issueDate = issueDate || existingCert.issueDate;
    existingCert.expiryDate = expiryDate || existingCert.expiryDate;
    existingCert.credentialId = credentialId !== undefined ? credentialId : existingCert.credentialId;
    existingCert.credentialUrl = credentialUrl !== undefined ? credentialUrl : existingCert.credentialUrl;
    existingCert.certificateFile = certificateFile;
    // Reset status if employee edits it? Optional, maybe keep as pending if it was rejected
    if (existingCert.status === 'Rejected') {
      existingCert.status = 'Pending';
    }
    
    await existingCert.save();
    
    res.status(200).json({ success: true, data: existingCert });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete certification
export const deleteCertification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const certification = await Certification.findOneAndDelete({ _id: id, userId });
    
    if (!certification) {
      return res.status(404).json({ success: false, error: 'Certification not found' });
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// HR Admin endpoints
export const getAllCertifications = async (req: Request, res: Response) => {
  try {
    const { status, expiring } = req.query;
    
    let query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (expiring === 'true') {
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setDate(today.getDate() + 30);
      
      query.expiryDate = {
        $gte: today,
        $lte: nextMonth
      };
    }
    
    const certifications = await Certification.find(query)
      .populate({
        path: 'userId',
        select: 'firstName lastName email employeeCode department departmentId designationId jobTitle',
        populate: [
          { path: 'departmentId', select: 'departmentName' },
          { path: 'designationId', select: 'designationName' }
        ]
      })
      .populate('verifiedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();
      
    const mappedCertifications = certifications.map((cert: any) => {
      if (cert.userId) {
        cert.userId.departmentName = cert.userId.departmentId 
          ? cert.userId.departmentId.departmentName 
          : (cert.userId.department || 'Not Assigned');
          
        cert.userId.designationName = cert.userId.designationId 
          ? cert.userId.designationId.designationName 
          : (cert.userId.jobTitle || 'Not Assigned');
      }
      return cert;
    });

    res.status(200).json({ success: true, data: mappedCertifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const verifyCertification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body; // 'Verified' or 'Rejected'
    const adminId = (req as any).user.id;
    
    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be Verified or Rejected' });
    }
    
    const updateData: any = { 
      status,
      verifiedBy: adminId,
      verifiedDate: new Date()
    };

    if (status === 'Rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    const certification = await Certification.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email');
    
    if (!certification) {
      return res.status(404).json({ success: false, error: 'Certification not found' });
    }
    
    res.status(200).json({ success: true, data: certification });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
