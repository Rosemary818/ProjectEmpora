import mongoose from 'mongoose';
import { User } from './backend/src/models/user.model.js';
import { Designation } from './backend/src/models/designation.model.js';
import { Promotion } from './backend/src/models/promotion.model.js';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const employee = await User.findOne({ email: 'jerin.biju@empora.com' });
    if (!employee) {
       const emp = await User.findOne({ employeeCode: 'EMP003' });
       console.log('EMP003:', emp);
       return;
    }
    console.log('Employee:', employee);
    
    const trimmedDesignation = 'Senior Software Engineer'.trim();
    let designation = await Designation.findOne({ 
      designationName: { $regex: new RegExp(`^${trimmedDesignation}$`, 'i') }, 
      departmentId: employee.departmentId 
    });

    if (!designation) {
      console.log('Creating new designation...');
      designation = await Designation.create({
        designationName: trimmedDesignation,
        departmentId: employee.departmentId,
        description: `Created during promotion proposal for ${employee.firstName} ${employee.lastName}`
      });
      console.log('Created Designation:', designation);
    }
    
    console.log('Creating promotion...');
    const promotion = new Promotion({
      employeeId: employee._id,
      departmentId: employee.departmentId,
      currentDesignationId: employee.designationId,
      proposedDesignationId: designation._id,
      reason: 'test',
      managerRemarks: 'test',
      status: 'Pending HR Review',
      proposedBy: employee.managerId || employee._id,
    });
    
    const error = promotion.validateSync();
    if (error) {
       console.error('Validation Error:', error);
    } else {
       console.log('Validation passed!');
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    mongoose.disconnect();
  }
}
test();
