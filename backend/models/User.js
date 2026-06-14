const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:              { type: String, required: true, trim: true },
  username:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  email:             { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:          { type: String, required: true, minlength: 8 },
  avatarUrl:         { type: String, default: '' },
  isVerified:        { type: Boolean, default: false },
  verifyCode:        { type: String },
  verifyCodeExpires: { type: Date },
  resetCode:         { type: String },
  resetCodeExpires:  { type: Date },
  resetToken:        { type: String },
  savedPins:         [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pin' }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
