const Task = require('../models/Task');
const ProjectMember = require('../models/ProjectMember');
const User = require('../models/User');

exports.getStats = async (req, res) => {
  try {
    // Get all projects user is a member of
    const memberships = await ProjectMember.find({ userId: req.user._id });
    const projectIds = memberships.map((m) => m.projectId);

    if (projectIds.length === 0) {
      return res.json({
        totalTasks: 0,
        byStatus: { todo: 0, in_progress: 0, done: 0 },
        byPriority: { low: 0, medium: 0, high: 0 },
        overdueTasks: 0,
        tasksByUser: [],
        recentTasks: [],
        projectCount: 0,
      });
    }

    // Total tasks across user's projects
    const totalTasks = await Task.countDocuments({
      projectId: { $in: projectIds },
    });

    // Tasks by status (aggregation)
    const statusAgg = await Task.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const byStatus = { todo: 0, in_progress: 0, done: 0 };
    statusAgg.forEach((s) => { byStatus[s._id] = s.count; });

    // Tasks by priority
    const priorityAgg = await Task.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);
    const byPriority = { low: 0, medium: 0, high: 0 };
    priorityAgg.forEach((p) => { byPriority[p._id] = p.count; });

    // Overdue tasks (due date in the past and not done)
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const overdueTasks = await Task.countDocuments({
      projectId: { $in: projectIds },
      dueDate: { $lt: now },
      status: { $ne: 'done' },
    });

    // Tasks per user (aggregation)
    const userAgg = await Task.aggregate([
      { $match: { projectId: { $in: projectIds }, assigneeId: { $ne: null } } },
      { $group: { _id: '$assigneeId', count: { $sum: 1 } } },
    ]);
    const assigneeIds = userAgg.map((u) => u._id);
    const assignees = await User.find({ _id: { $in: assigneeIds } }).select('name email');
    const assigneeMap = {};
    assignees.forEach((u) => { assigneeMap[u._id.toString()] = u; });

    const tasksByUser = userAgg.map((u) => ({
      user: assigneeMap[u._id.toString()]
        ? { id: assigneeMap[u._id.toString()]._id, name: assigneeMap[u._id.toString()].name, email: assigneeMap[u._id.toString()].email }
        : null,
      count: u.count,
    }));

    // Recent tasks
    const recentTasks = await Task.find({ projectId: { $in: projectIds } })
      .populate('assigneeId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedRecent = recentTasks.map((t) => ({
      ...t.toObject(),
      id: t._id,
      assignee: t.assigneeId,
      assigneeId: t.assigneeId?._id || null,
    }));

    // Project count
    const projectCount = projectIds.length;

    res.json({
      totalTasks,
      byStatus,
      byPriority,
      overdueTasks,
      tasksByUser,
      recentTasks: formattedRecent,
      projectCount,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error fetching dashboard stats.' });
  }
};
