const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    await User.updateOne({ email: 'hradmin@gmail.com' }, { $set: { password: hashedPassword } });
    console.log("Password reset to Admin@123");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
resetPassword();
