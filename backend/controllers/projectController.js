const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const User = require('../models/User');
const Task = require('../models/Task');

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required.' });
    }

    const project = await Project.create({
      name,
      description: description || '',
      createdBy: req.user._id,
    });

    // Creator becomes Admin
    await ProjectMember.create({
      projectId: project._id,
      userId: req.user._id,
      role: 'admin',
    });

    // Fetch full project with populated data
    const creator = { _id: req.user._id, name: req.user.name, email: req.user.email };
    const fullProject = {
      ...project.toObject(),
      id: project._id,
      creator,
      projectMembers: [{ userId: req.user._id, role: 'admin', user: creator }],
    };

    res.status(201).json({ message: 'Project created.', project: fullProject });
  } catch (error) {
    res.status(500).json({ error: 'Server error creating project.' });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const memberships = await ProjectMember.find({ userId: req.user._id });

    const projectIds = memberships.map((m) => m.projectId);
    const projects = await Project.find({ _id: { $in: projectIds } })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Get all members for these projects
    const allMembers = await ProjectMember.find({ projectId: { $in: projectIds } });
    const memberUserIds = [...new Set(allMembers.map((m) => m.userId.toString()))];
    const users = await User.find({ _id: { $in: memberUserIds } }).select('name email');
    const userMap = {};
    users.forEach((u) => { userMap[u._id.toString()] = u; });

    // Build role map for current user
    const roleMap = {};
    memberships.forEach((m) => { roleMap[m.projectId.toString()] = m.role; });

    const result = projects.map((project) => {
      const projectMembers = allMembers
        .filter((m) => m.projectId.toString() === project._id.toString())
        .map((m) => ({
          userId: m.userId,
          role: m.role,
          user: userMap[m.userId.toString()] || null,
        }));

      return {
        ...project.toObject(),
        id: project._id,
        creator: project.createdBy,
        projectMembers,
        myRole: roleMap[project._id.toString()],
      };
    });

    res.json({ projects: result });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching projects.' });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Get members
    const members = await ProjectMember.find({ projectId: project._id });
    const memberUserIds = members.map((m) => m.userId);
    const users = await User.find({ _id: { $in: memberUserIds } }).select('name email');
    const userMap = {};
    users.forEach((u) => { userMap[u._id.toString()] = u; });

    const projectMembers = members.map((m) => ({
      userId: m.userId,
      role: m.role,
      user: userMap[m.userId.toString()] || null,
    }));

    // Get tasks
    const tasks = await Task.find({ projectId: project._id })
      .populate('assigneeId', 'name email')
      .sort({ createdAt: -1 });

    const formattedTasks = tasks.map((t) => ({
      ...t.toObject(),
      id: t._id,
      assignee: t.assigneeId,
      assigneeId: t.assigneeId?._id || null,
    }));

    // Get current user's role
    const membership = await ProjectMember.findOne({
      projectId: project._id,
      userId: req.user._id,
    });

    res.json({
      project: {
        ...project.toObject(),
        id: project._id,
        creator: project.createdBy,
        projectMembers,
        tasks: formattedTasks,
        myRole: membership ? membership.role : null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching project.' });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const projectId = req.params.id;

    if (!email) {
      return res.status(400).json({ error: 'Member email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found with that email.' });
    }

    const existing = await ProjectMember.findOne({ projectId, userId: user._id });
    if (existing) {
      return res.status(400).json({ error: 'User is already a member of this project.' });
    }

    await ProjectMember.create({
      projectId,
      userId: user._id,
      role: role || 'member',
    });

    res.status(201).json({
      message: 'Member added.',
      member: { id: user._id, name: user.name, email: user.email, role: role || 'member' },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error adding member.' });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { id: projectId, userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot remove yourself from the project.' });
    }

    const membership = await ProjectMember.findOne({ projectId, userId });
    if (!membership) {
      return res.status(404).json({ error: 'Member not found in this project.' });
    }

    // Unassign tasks from this user in this project
    await Task.updateMany(
      { projectId, assigneeId: userId },
      { $set: { assigneeId: null } }
    );

    await ProjectMember.deleteOne({ _id: membership._id });
    res.json({ message: 'Member removed.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error removing member.' });
  }
};
