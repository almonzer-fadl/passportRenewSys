import mongoose from 'mongoose';

const userSchema = {
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  role: { type: String, enum: ['citizen', 'admin', 'super_admin'], default: 'citizen' },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    nationalId: { type: String, required: true, unique: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

export default mongoose.models.User || mongoose.model('User', userSchema);
