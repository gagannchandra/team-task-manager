const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    minlength: [2, 'Project name must be at least 2 characters'],
    maxlength: [200, 'Project name cannot exceed 200 characters'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Project', projectSchema);
