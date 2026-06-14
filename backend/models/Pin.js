const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:    { type: String, required: true, trim: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});

const pinSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 200 },
  imageUrl:    { type: String, required: true },
  s3Key:       { type: String, required: true },
  category:    { type: String, default: '' },
  author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  saves:       { type: Number, default: 0 },
  likes:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments:    [commentSchema],
}, { timestamps: true });

module.exports = mongoose.model('Pin', pinSchema);
