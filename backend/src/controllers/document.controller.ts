import { Request, Response } from 'express';
import { DocumentModel } from '../models/document.model';
import { AppError } from '../utils/error';
import fs from 'fs';
import path from 'path';

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { name, description, category, visibility } = req.body;
    
    let certificateMetadata;
    if (req.body.certificateMetadata) {
      try {
        certificateMetadata = typeof req.body.certificateMetadata === 'string' 
          ? JSON.parse(req.body.certificateMetadata) 
          : req.body.certificateMetadata;
      } catch (e) {
        throw new AppError('Invalid certificate metadata format', 400);
      }
    }

    if (!req.file && (!certificateMetadata || !certificateMetadata.certificateUrl)) {
      throw new AppError('No file uploaded and no certificate URL provided', 400);
    }

    if (!name || !category || !visibility) {
      // If validation fails, clean up the uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      throw new AppError('Name, category, and visibility are required', 400);
    }

    // Determine ownerId
    let ownerId = null;
    if (visibility === 'Private') {
      ownerId = req.user._id;
    }

    const newDocument = await DocumentModel.create({
      name,
      description,
      category,
      fileUrl: req.file ? req.file.path : undefined,
      fileName: req.file ? req.file.originalname : undefined,
      fileType: req.file ? req.file.mimetype : undefined,
      fileSize: req.file ? req.file.size : undefined,
      certificateMetadata,
      uploadedBy: req.user._id,
      ownerId,
      visibility,
    });

    res.status(201).json({
      status: 'success',
      data: {
        document: newDocument,
      },
    });
  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const { category, visibility, status } = req.query;
    
    // Build query based on user role
    const query: any = {};
    
    // Apply filters if provided
    if (category) query.category = category;
    if (visibility) query.visibility = visibility;
    if (status) query.status = status;

    if (req.user.role === 'HRAdmin' || req.user.role === 'SuperAdmin') {
      // Admins can see everything matching filters
    } else if (req.user.role === 'Employee' || req.user.role === 'Manager') {
      // Regular users can see their own private documents AND company/team documents
      query.$or = [
        { ownerId: req.user._id },
        { visibility: 'Company' },
      ];
      if (req.user.role === 'Manager') {
         query.$or.push({ visibility: 'Team' });
      }
    } else {
      throw new AppError('Unauthorized access', 403);
    }

    const documents = await DocumentModel.find(query)
      .populate('uploadedBy', 'firstName lastName email')
      .populate('ownerId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: {
        documents,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const document = await DocumentModel.findById(req.params.id)
      .populate('uploadedBy', 'firstName lastName email')
      .populate('ownerId', 'firstName lastName email');

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Access control check
    if (req.user.role !== 'HRAdmin' && req.user.role !== 'SuperAdmin') {
       if (document.visibility === 'Private' && document.ownerId?.toString() !== req.user._id.toString()) {
           throw new AppError('You do not have permission to view this document', 403);
       }
       if (document.visibility === 'Team' && req.user.role === 'Employee') { // Assuming employees can't see team ones unless their owner is them or team is set up differently
           throw new AppError('You do not have permission to view this document', 403);
       }
    }

    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const downloadDocument = async (req: Request, res: Response) => {
  try {
    const document = await DocumentModel.findById(req.params.id);

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Access control check
    if (req.user.role !== 'HRAdmin' && req.user.role !== 'SuperAdmin') {
       if (document.visibility === 'Private' && document.ownerId?.toString() !== req.user._id.toString()) {
           throw new AppError('You do not have permission to download this document', 403);
       }
       if (document.visibility === 'Team' && req.user.role === 'Employee') {
           throw new AppError('You do not have permission to download this document', 403);
       }
    }

    if (!document.fileUrl || !fs.existsSync(document.fileUrl)) {
        throw new AppError('File not found on server', 404);
    }

    res.download(document.fileUrl, document.fileName || 'downloaded-file');
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const document = await DocumentModel.findById(req.params.id);

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Access control check
    if (req.user.role === 'HRAdmin' || req.user.role === 'SuperAdmin') {
        // Can delete anything
    } else {
        // Can only delete own private document
        if (document.ownerId?.toString() !== req.user._id.toString()) {
            throw new AppError('You do not have permission to delete this document', 403);
        }
    }

    // Remove file from filesystem
    if (document.fileUrl && fs.existsSync(document.fileUrl)) {
      fs.unlinkSync(document.fileUrl);
    }

    // Remove from DB
    await DocumentModel.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message,
    });
  }
};
