import { Request, Response } from 'express';
import { Skill, EmployeeSkill } from '../models/skill.model';
import { AppError } from '../utils/error';

// Get all predefined skills
export const getAllSkills = async (req: Request, res: Response) => {
  try {
    const skills = await Skill.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: skills });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add a predefined skill (can be used by employees when typing a new skill)
export const addSkill = async (req: Request, res: Response) => {
  try {
    const { name, category } = req.body;
    
    let skill = await Skill.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (!skill) {
      skill = await Skill.create({ name, category });
    }
    
    res.status(201).json({ success: true, data: skill });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get employee's skills
export const getEmployeeSkills = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId || (req as any).user.id;
    
    const employeeSkills = await EmployeeSkill.find({ userId })
      .populate('skillId', 'name category')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, data: employeeSkills });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add skill to employee
export const addEmployeeSkill = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { skillName, level, category } = req.body;
    
    if (!skillName || !level) {
      return res.status(400).json({ success: false, error: 'Skill name and level are required' });
    }
    
    // Check if skill exists, if not create it
    let skill = await Skill.findOne({ name: { $regex: new RegExp(`^${skillName}$`, 'i') } });
    if (!skill) {
      skill = await Skill.create({ name: skillName, category: category || 'Professional Skills' });
    } else if (!skill.category && category) {
      skill.category = category;
      await skill.save();
    }
    
    // Check if employee already has this skill
    const existingEmpSkill = await EmployeeSkill.findOne({ userId, skillId: skill._id });
    if (existingEmpSkill) {
      // Update level if it exists
      existingEmpSkill.level = level;
      await existingEmpSkill.save();
      return res.status(200).json({ success: true, data: existingEmpSkill });
    }
    
    const employeeSkill = await EmployeeSkill.create({
      userId,
      skillId: skill._id,
      level,
    });
    
    const populated = await employeeSkill.populate('skillId', 'name category');
    
    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'You already have this skill' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// HR Admin: Get all employee skills
export const getAllEmployeeSkills = async (req: Request, res: Response) => {
  try {
    const { skillId } = req.query;
    let query: any = {};
    if (skillId) {
      query.skillId = skillId;
    }

    const employeeSkills = await EmployeeSkill.find(query)
      .populate({
        path: 'userId',
        select: 'firstName lastName email employeeCode department departmentId jobTitle designationId',
        populate: [
          { path: 'departmentId', select: 'departmentName' },
          { path: 'designationId', select: 'designationName' }
        ]
      })
      .populate('skillId', 'name category')
      .sort({ createdAt: -1 })
      .lean();
      
    const mappedSkills = employeeSkills.map((empSkill: any) => {
      if (empSkill.userId) {
        empSkill.userId.departmentName = empSkill.userId.departmentId 
          ? empSkill.userId.departmentId.departmentName 
          : (empSkill.userId.department || 'Not Assigned');
          
        empSkill.userId.designationName = empSkill.userId.designationId 
          ? empSkill.userId.designationId.designationName 
          : (empSkill.userId.jobTitle || 'Not Assigned');
      }
      return empSkill;
    });

    res.status(200).json({ success: true, data: mappedSkills });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Edit employee skill level
export const updateEmployeeSkill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { level } = req.body;
    const userId = (req as any).user.id;
    
    const employeeSkill = await EmployeeSkill.findOneAndUpdate(
      { _id: id, userId },
      { level },
      { new: true, runValidators: true }
    ).populate('skillId', 'name category');
    
    if (!employeeSkill) {
      return res.status(404).json({ success: false, error: 'Skill not found' });
    }
    
    res.status(200).json({ success: true, data: employeeSkill });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete employee skill
export const deleteEmployeeSkill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const employeeSkill = await EmployeeSkill.findOneAndDelete({ _id: id, userId });
    
    if (!employeeSkill) {
      return res.status(404).json({ success: false, error: 'Skill not found' });
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
