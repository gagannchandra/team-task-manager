const mongoose = require('mongoose');

const projectMemberSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member',
  },
}, {
  timestamps: true,
});

// Ensure a user can only be a member of a project once
projectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ProjectMember', projectMemberSchema);
