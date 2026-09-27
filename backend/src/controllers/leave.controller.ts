import { Request, Response, NextFunction } from 'express';
import { LeaveRequest } from '../models/leave.model';
import { AppError } from '../utils/error';
import mongoose from 'mongoose';

// Calculate number of weekdays between two dates
const calculateDays = (start: Date, end: Date): number => {
  let count = 0;
  let curDate = new Date(start.getTime());

  while (curDate <= end) {
    const dayOfWeek = curDate.getDay();

    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }

    curDate.setDate(curDate.getDate() + 1);
  }

  return count;
};

export const calculateLeaveBalances = async (userId: string) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const fyStartYear = currentYear;

  const quartersToCredit = Math.floor(currentMonth / 3) + 1;
  const currentQuarter = `Q${quartersToCredit}`;

  const credited = {
    'Earned Leave': 2.5 * quartersToCredit,
    'Casual Leave': 1 * quartersToCredit,
    'Sick Leave': 1.5 * quartersToCredit
  };

  const startOfFY = new Date(fyStartYear, 0, 1);
  const endOfFY = new Date(
    fyStartYear,
    11,
    31,
    23,
    59,
    59,
    999
  );

  const approvedLeaves = await LeaveRequest.find({
    userId,
    status: 'Approved',
    startDate: {
      $gte: startOfFY,
      $lte: endOfFY
    },
    leaveType: {
      $in: ['Earned Leave', 'Casual Leave', 'Sick Leave']
    }
  });

  const used = {
    'Earned Leave': 0,
    'Casual Leave': 0,
    'Sick Leave': 0
  };

  approvedLeaves.forEach(leave => {
    if (
      used[leave.leaveType as keyof typeof used] !== undefined
    ) {
      used[leave.leaveType as keyof typeof used] +=
        leave.numberOfDays;
    }
  });

  return {
    balances: {
      'Earned Leave': {
        credited: credited['Earned Leave'],
        used: used['Earned Leave'],
        remaining:
          credited['Earned Leave'] - used['Earned Leave']
      },
      'Casual Leave': {
        credited: credited['Casual Leave'],
        used: used['Casual Leave'],
        remaining:
          credited['Casual Leave'] - used['Casual Leave']
      },
      'Sick Leave': {
        credited: credited['Sick Leave'],
        used: used['Sick Leave'],
        remaining:
          credited['Sick Leave'] - used['Sick Leave']
      }
    },
    currentQuarter
  };
};

export const applyLeave = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      reason,
      relationship
    } = req.body;

    let documentUrl;

    if (req.file) {
      documentUrl = `/uploads/${req.file.filename}`;
    }

    if (!leaveType || !startDate || !endDate || !reason) {
      return next(
        new AppError(
          'Please provide all required fields',
          400
        )
      );
    }

    if (
      leaveType === 'Bereavement Leave' &&
      !relationship
    ) {
      return next(
        new AppError(
          'Please provide the relationship for Bereavement Leave',
          400
        )
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return next(
        new AppError(
          'End date cannot be before start date',
          400
        )
      );
    }

    const numberOfDays = calculateDays(start, end);

    if (numberOfDays === 0) {
      return next(
        new AppError(
          'Leave duration must include at least one working day',
          400
        )
      );
    }

    if (
      [
        'Earned Leave',
        'Casual Leave',
        'Sick Leave'
      ].includes(leaveType)
    ) {
      const { balances } =
        await calculateLeaveBalances(
          req.user._id.toString()
        );

      const remaining =
        balances[
          leaveType as keyof typeof balances
        ].remaining;

      if (numberOfDays > remaining) {
        return next(
          new AppError(
            `Insufficient balance. You have ${remaining} days of ${leaveType} remaining, but requested ${numberOfDays} days.`,
            400
          )
        );
      }
    }

    const leaveRequest = await LeaveRequest.create({
      userId: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      numberOfDays,
      reason,
      documentUrl,
      relationship,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      data: leaveRequest
    });
  } catch (error: any) {
    next(error);
  }
};

export const getMyLeaves = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const leaves = await LeaveRequest.find({
      userId: req.user._id
    }).sort('-createdAt');

    const {
      balances,
      currentQuarter
    } = await calculateLeaveBalances(
      req.user._id.toString()
    );

    res.status(200).json({
      success: true,
      data: leaves,
      balances,
      currentQuarter
    });
  } catch (error: any) {
    next(error);
  }
};

export const getAllLeaves = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let query: any = {};
    const { role, _id } = req.user as any;

    if (role === 'Manager') {
      const projects =
        await mongoose.models.Project.find({
          managerId: _id
        });

      const teamMemberIds = [
        ...new Set(
          projects.flatMap(p =>
            p.teamMembers.map(
              (id: any) => id.toString()
            )
          )
        )
      ];

      const validTeamMembers =
        await mongoose.models.User.find({
          _id: { $in: teamMemberIds },
          role: {
            $in: [
              'Employee',
              'ServiceExecutive'
            ]
          }
        });

      const validTeamMemberIds =
        validTeamMembers.map(u =>
          u._id.toString()
        );

      query = {
        userId: {
          $in: validTeamMemberIds,
          $ne: _id
        }
      };
    }

    const leaves = await LeaveRequest.find(query)
      .populate({
        path: 'userId',
        select:
          'firstName lastName email departmentId designationId role',
        populate: [
          {
            path: 'departmentId',
            select: 'departmentName'
          },
          {
            path: 'designationId',
            select: 'designationName'
          }
        ]
      })
      .sort('-createdAt')
      .lean();

    let filteredLeaves = leaves.filter(
      (leave: any) =>
        leave.userId &&
        leave.userId.role !== 'Candidate'
    );

    const mappedLeaves = filteredLeaves.map(
      (leave: any) => {
        if (leave.userId) {
          leave.userId.departmentName =
            leave.userId.departmentId?.departmentName ||
            'Not Assigned';

          leave.userId.designationName =
            leave.userId.designationId?.designationName ||
            'Not Set';
        }

        return leave;
      }
    );

    res.status(200).json({
      success: true,
      data: mappedLeaves
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateLeaveStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      status,
      rejectionReason
    } = req.body;

    if (
      !['Approved', 'Rejected'].includes(status)
    ) {
      return next(
        new AppError(
          'Invalid status',
          400
        )
      );
    }

    const leave =
      await LeaveRequest.findById(
        req.params.id
      );

    if (!leave) {
      return next(
        new AppError(
          'Leave request not found',
          404
        )
      );
    }

    const { role, _id } =
      req.user as any;

    if (
      leave.userId.toString() ===
      _id.toString()
    ) {
      return next(
        new AppError(
          'You cannot approve/reject your own leave request',
          403
        )
      );
    }

    if (role === 'Manager') {
      const projects =
        await mongoose.models.Project.find({
          managerId: _id
        });

      const teamMemberIds = [
        ...new Set(
          projects.flatMap(p =>
            p.teamMembers.map(
              (id: any) => id.toString()
            )
          )
        )
      ];

      if (
        !teamMemberIds.includes(
          leave.userId.toString()
        )
      ) {
        return next(
          new AppError(
            'You can only approve leave requests for your own team members',
            403
          )
        );
      }

      const leaveUser =
        await mongoose.models.User.findById(
          leave.userId
        );

      if (
        !leaveUser ||
        ![
          'Employee',
          'ServiceExecutive'
        ].includes(leaveUser.role)
      ) {
        return next(
          new AppError(
            'Managers can only approve leave requests for Employees and Service Executives',
            403
          )
        );
      }
    }

    leave.status = status;

    if (status === 'Rejected') {
      leave.rejectionReason =
        rejectionReason;
    }

    await leave.save();

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error: any) {
    next(error);
  }
};