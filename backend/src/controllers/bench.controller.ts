import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { InternalApplication } from '../models/internalApplication.model';
import { InternalOpportunity } from '../models/internalOpportunity.model';

// ==========================================
// HR ADMIN ENDPOINTS
// ==========================================

export const getBenchEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await User.find({ benchStatus: 'On Bench' })
      .populate('departmentId', 'departmentName')
      .populate('designationId', 'title')
      .select('-password');
    res.status(200).json({ success: true, data: employees });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBenchDashboardStats = async (req: Request, res: Response) => {
  try {
    const benchEmployees = await User.find({ benchStatus: 'On Bench' }).populate('departmentId', 'departmentName');

    let totalOnBench = benchEmployees.length;
    let over30Days = 0;
    let over60Days = 0;
    let deptCounts: Record<string, number> = {};
    let skillCounts: Record<string, number> = {};

    const now = new Date();

    benchEmployees.forEach(emp => {
      // Department count
      const deptName = (emp.departmentId as any)?.departmentName || 'Unknown';
      deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;

      // Skill count
      if (emp.skills) {
        emp.skills.forEach(skill => {
          skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
        });
      }

      // Duration
      if (emp.benchStartDate) {
        const diffTime = Math.abs(now.getTime() - new Date(emp.benchStartDate).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 60) {
          over60Days++;
        } else if (diffDays >= 30) {
          over30Days++;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalOnBench,
        availableEmployees: totalOnBench, // all on bench are available
        over30Days,
        over60Days,
        deptCounts,
        skillCounts
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBenchStatus = async (req: Request, res: Response) => {
  try {
    return res.status(400).json({
      success: false,
      message: 'Bench status is now automatically derived from project allocations and cannot be manually updated.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// EMPLOYEE ENDPOINTS
// ==========================================

export const getMyBenchStatus = async (req: Request, res: Response) => {
  try {
    const employeeId = (req as any).user.id;
    const employee = await User.findById(employeeId).select('benchStatus benchStartDate benchReason benchHistory skills departmentId designationId');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, data: employee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecommendedProjects = async (req: Request, res: Response) => {
  try {
    const employeeId = (req as any).user.id;
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // A simple recommendation: projects with the same department as the employee, 
    // or just all active/planning projects since we don't have explicit project skills in the schema
    const query: any = { status: { $in: ['Active', 'Upcoming'] } };
    if (employee.departmentId) {
      query.departmentId = employee.departmentId;
    }

    let projects = await Project.find(query).populate('managerId', 'firstName lastName email');

    // If none found in same dept, return all active/planning projects
    if (projects.length === 0) {
      projects = await Project.find({ status: { $in: ['Active', 'Upcoming'] } }).populate('managerId', 'firstName lastName email');
    }

    res.status(200).json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecommendedOpportunities = async (req: Request, res: Response) => {
  try {
    const employeeId = (req as any).user.id;
    const employee = await User.findById(employeeId).select('skills departmentId');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const employeeSkills = (employee.skills || []).map(s => s.name.toLowerCase());

    // Fetch projects
    const projects = await Project.find({ status: { $in: ['Active', 'Upcoming'] } })
      .populate('managerId', 'firstName lastName email')
      .populate('departmentId', 'departmentName');

    // Fetch Internal Opportunities
    const internalOpps = await InternalOpportunity.find({ status: 'Published' })
      .populate('departmentId', 'departmentName');

    // Fetch existing applications to map status
    const applications = await InternalApplication.find({ employeeId });

    const getAppStatus = (projectId?: string, oppId?: string) => {
      const app = applications.find(a =>
        (projectId && a.projectId?.toString() === projectId.toString()) ||
        (oppId && a.opportunityId?.toString() === oppId.toString())
      );
      return app ? app.status : null;
    };

    let opportunities: any[] = [];

    // Map projects
    projects.forEach(p => {
      const reqSkills = (p.requiredSkills || []).map(s => s.toLowerCase());
      let matchedSkills: string[] = [];
      let missingSkills: string[] = [];

      reqSkills.forEach(rs => {
        if (employeeSkills.includes(rs)) matchedSkills.push(rs);
        else missingSkills.push(rs);
      });

      const matchPercentage = reqSkills.length > 0 ? Math.round((matchedSkills.length / reqSkills.length) * 100) : 100;

      opportunities.push({
        _id: p._id,
        type: 'Project',
        title: p.name,
        department: (p.departmentId as any)?.departmentName || 'Unknown',
        manager: p.managerId,
        experienceRequired: p.experienceRequired || 'Not specified',
        requiredSkills: p.requiredSkills || [],
        matchedSkills,
        missingSkills,
        matchPercentage,
        applicationStatus: getAppStatus(p._id as string, undefined)
      });
    });

    // Map internal opportunities
    internalOpps.forEach(o => {
      const reqSkills = (o.requiredSkills || []).map(s => s.toLowerCase());
      let matchedSkills: string[] = [];
      let missingSkills: string[] = [];

      reqSkills.forEach(rs => {
        if (employeeSkills.includes(rs)) matchedSkills.push(rs);
        else missingSkills.push(rs);
      });

      const matchPercentage = reqSkills.length > 0 ? Math.round((matchedSkills.length / reqSkills.length) * 100) : 100;

      opportunities.push({
        _id: o._id,
        type: 'InternalOpportunity',
        title: o.title,
        department: (o.departmentId as any)?.departmentName || 'Unknown',
        experienceRequired: o.experienceRequired || 'Not specified',
        requiredSkills: o.requiredSkills || [],
        matchedSkills,
        missingSkills,
        matchPercentage,
        applicationStatus: getAppStatus(undefined, o._id as string)
      });
    });

    // Sort by match percentage descending
    opportunities.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.status(200).json({ success: true, data: opportunities });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyForProject = async (req: Request, res: Response) => {
  try {
    const employeeId = (req as any).user.id;
    const { projectId, reason, relevantSkills, additionalComments } = req.body;

    const existingApp = await InternalApplication.findOne({ employeeId, projectId });
    if (existingApp) {
      return res.status(400).json({ success: false, message: 'You have already applied for this project' });
    }

    const employee = await User.findById(employeeId);
    if (!employee || !employee.departmentId || !employee.designationId) {
      return res.status(400).json({ success: false, message: 'Employee profile is incomplete' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const application = new InternalApplication({
      employeeId,
      projectId,
      currentDepartmentId: employee.departmentId,
      currentDesignationId: employee.designationId,
      // Target is not strictly applicable for project allocation in the same sense, but we can reuse it or omit it
      // since we made it optional
      reason,
      relevantSkills,
      additionalComments,
      managerRecommendation: 'Pending'
    });

    await application.save();
    res.status(201).json({ success: true, data: application });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==========================================
// MANAGER ENDPOINTS
// ==========================================

export const getManagerTeamBench = async (req: Request, res: Response) => {
  try {
    const managerId = (req as any).user.id;
    const employees = await User.find({ managerId, benchStatus: 'On Bench' })
      .populate('departmentId', 'departmentName')
      .populate('designationId', 'title')
      .select('-password');
    res.status(200).json({ success: true, data: employees });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAvailableBenchEmployees = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;

    const employees = await User.find({ benchStatus: 'On Bench' })
      .populate('departmentId', 'departmentName')
      .populate('designationId', 'title')
      .select('-password');

    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        const reqSkills = project.requiredSkills?.map(s => s.toLowerCase()) || [];
        const mappedEmployees = employees.map(emp => {
          const empData = emp.toObject();
          const empSkills = emp.skills?.map(s => s.name.toLowerCase()) || [];
          let matchCount = 0;
          reqSkills.forEach(rs => {
            if (empSkills.includes(rs)) matchCount++;
          });
          const matchPercentage = reqSkills.length > 0 ? Math.round((matchCount / reqSkills.length) * 100) : 100;
          return { ...empData, matchPercentage };
        });
        return res.status(200).json({ success: true, data: mappedEmployees.sort((a, b) => b.matchPercentage - a.matchPercentage) });
      }
    }

    res.status(200).json({ success: true, data: employees });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestAllocation = async (req: Request, res: Response) => {
  try {
    const { employeeId, projectId } = req.body;

    const employee = await User.findById(employeeId);
    if (!employee || employee.benchStatus !== 'On Bench') {
      return res.status(400).json({ success: false, message: 'Employee is not available on bench' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    employee.benchStatus = 'Allocation Requested';
    employee.requestedProjectId = projectId as any;
    await employee.save();

    res.status(200).json({ success: true, data: employee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectApplications = async (req: Request, res: Response) => {
  try {
    const managerId = (req as any).user.id;
    // Find all projects managed by this manager
    const projects = await Project.find({ managerId });
    const projectIds = projects.map(p => p._id);

    // Find applications for these projects
    const applications = await InternalApplication.find({ projectId: { $in: projectIds } })
      .populate('employeeId', 'firstName lastName email profileImage benchStatus')
      .populate('projectId', 'name')
      .populate('currentDepartmentId', 'departmentName')
      .populate('currentDesignationId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: applications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
