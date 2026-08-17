import { Request, Response } from 'express';
import { Policy } from '../models/policy.model';

// @desc    Create a new policy
// @route   POST /api/policies
// @access  Private (HR Admin)
export const createPolicy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, description, content, status } = req.body;

    const policy = new Policy({
      title,
      category,
      description,
      content,
      status: status || 'Active',
      createdBy: (req as any).user._id,
    });

    const savedPolicy = await policy.save();

    res.status(201).json({
      success: true,
      data: savedPolicy,
      message: 'Policy created successfully',
    });
  } catch (error: any) {
    console.error('Error creating policy:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create policy',
    });
  }
};

// @desc    Get all policies
// @route   GET /api/policies
// @access  Private (All)
export const getPolicies = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user.role;
    let query: any = {};

    // Only HR Admins can see inactive policies
    if (userRole !== 'HRAdmin' && userRole !== 'SuperAdmin') {
      query.status = 'Active';
    }

    // Filter by category
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    // Filter by search term
    if (req.query.search) {
      query.$text = { $search: req.query.search as string };
    }

    const policies = await Policy.find(query).sort({ updatedAt: -1 }).populate('createdBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      count: policies.length,
      data: policies,
    });
  } catch (error: any) {
    console.error('Error fetching policies:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Get policy by ID
// @route   GET /api/policies/:id
// @access  Private (All)
export const getPolicyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const policy = await Policy.findById(req.params.id).populate('createdBy', 'firstName lastName');

    if (!policy) {
      res.status(404).json({
        success: false,
        message: 'Policy not found',
      });
      return;
    }

    const userRole = (req as any).user.role;
    // Non-admins cannot view inactive policies
    if (policy.status === 'Inactive' && userRole !== 'HRAdmin' && userRole !== 'SuperAdmin') {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to view this policy',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: policy,
    });
  } catch (error: any) {
    console.error('Error fetching policy by ID:', error);
    if (error.kind === 'ObjectId') {
      res.status(404).json({
        success: false,
        message: 'Policy not found',
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Update a policy
// @route   PUT /api/policies/:id
// @access  Private (HR Admin)
export const updatePolicy = async (req: Request, res: Response): Promise<void> => {
  try {
    let policy = await Policy.findById(req.params.id);

    if (!policy) {
      res.status(404).json({
        success: false,
        message: 'Policy not found',
      });
      return;
    }

    const { title, category, description, content, status } = req.body;

    policy = await Policy.findByIdAndUpdate(
      req.params.id,
      {
        title,
        category,
        description,
        content,
        status,
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: policy,
      message: 'Policy updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating policy:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update policy',
    });
  }
};

// @desc    Delete a policy
// @route   DELETE /api/policies/:id
// @access  Private (HR Admin)
export const deletePolicy = async (req: Request, res: Response): Promise<void> => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      res.status(404).json({
        success: false,
        message: 'Policy not found',
      });
      return;
    }

    await policy.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Policy deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting policy:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};
