import { Request, Response } from 'express';
import { Resume } from '../models/resume.model';
import path from 'path';
import fs from 'fs';

export const getMyResume = async (req: Request, res: Response) => {
  try {
    const candidateId = req.user?._id;
    const resume = await Resume.findOne({ candidateId });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found.' });
    }

    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching resume.' });
  }
};

export const uploadResume = async (req: Request, res: Response) => {
  try {
    const candidateId = req.user?._id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const resumeUrl = `/uploads/resumes/${file.filename}`;

    let resume = await Resume.findOne({ candidateId });

    if (resume) {
      // Optional: Delete old file
      const oldFilePath = path.join(__dirname, '../../', resume.resumeUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      resume.resumeUrl = resumeUrl;
      resume.originalName = file.originalname;
      resume.mimeType = file.mimetype;
      resume.size = file.size;
      await resume.save();
    } else {
      resume = await Resume.create({
        candidateId,
        resumeUrl,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });
    }

    res.status(201).json({ success: true, message: 'Resume uploaded successfully.', resume });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ success: false, error: 'Server error uploading resume.' });
  }
};

export const deleteMyResume = async (req: Request, res: Response) => {
  try {
    const candidateId = req.user?._id;
    const resume = await Resume.findOne({ candidateId });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found.' });
    }

    const filePath = path.join(__dirname, '../../', resume.resumeUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Resume.deleteOne({ _id: resume._id });

    res.json({ success: true, message: 'Resume deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error deleting resume.' });
  }
};

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templatesDir = path.join(__dirname, '../../uploads/templates');
    if (!fs.existsSync(templatesDir)) {
      return res.json({ success: true, templates: [] });
    }

    const files = fs.readdirSync(templatesDir);
    const templates = files
      .filter(f => f.endsWith('.docx'))
      .map(f => ({
        filename: f,
        name: f.replace(/_Template\.docx$/, '').replace(/_/g, ' '),
        url: `/uploads/templates/${f}`
      }));

    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching templates.' });
  }
};
