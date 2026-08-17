import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testSchema = new mongoose.Schema({ name: String, type: String });
testSchema.pre('save', function () {
  if (this.type === 'Online') {
     // do nothing
  }
});
const TestModel = mongoose.model('TestSyncHook', testSchema);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/empora')
  .then(async () => {
    try {
      await TestModel.create({ name: 'test', type: 'Online' });
      console.log('Created successfully');
    } catch (e: any) {
      console.error('CAUGHT ERROR:', e.message);
    }
    process.exit(0);
  });
