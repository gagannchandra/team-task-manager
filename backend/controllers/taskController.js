const Task = require('../models/Task');
const User = require('../models/User');
const ProjectMember = require('../models/ProjectMember');

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, assigneeId } = req.body;
    const projectId = req.params.projectId;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    // If assignee specified, check they're a project member
    if (assigneeId) {
      const isMember = await ProjectMember.findOne({ projectId, userId: assigneeId });
      if (!isMember) {
        return res.status(400).json({ error: 'Assignee must be a project member.' });
      }
    }

    const task = await Task.create({
      title,
      description: description || '',
      dueDate: dueDate || null,
      priority: priority || 'medium',
      status: 'todo',
      projectId,
      assigneeId: assigneeId || null,
      createdBy: req.user._id,
    });

    const fullTask = await Task.findById(task._id)
      .populate('assigneeId', 'name email');

    const result = {
      ...fullTask.toObject(),
      id: fullTask._id,
      assignee: fullTask.assigneeId,
      assigneeId: fullTask.assigneeId?._id || null,
    };

    res.status(201).json({ message: 'Task created.', task: result });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Server error creating task.' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const query = { projectId };

    // Members can only see their assigned tasks
    if (req.membership.role === 'member') {
      query.assigneeId = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('assigneeId', 'name email')
      .sort({ createdAt: -1 });

    const result = tasks.map((t) => ({
      ...t.toObject(),
      id: t._id,
      assignee: t.assigneeId,
      assigneeId: t.assigneeId?._id || null,
    }));

    res.json({ tasks: result });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching tasks.' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { taskId, projectId } = req.params;
    const task = await Task.findOne({ _id: taskId, projectId });

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    // Members can only update status of their assigned tasks
    if (req.membership.role === 'member') {
      if (!task.assigneeId || task.assigneeId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'You can only update tasks assigned to you.' });
      }
      // Members can only update status
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Only status update is allowed for members.' });
      }
      task.status = status;
    } else {
      // Admin can update all fields
      const { title, description, status, priority, dueDate, assigneeId } = req.body;

      if (assigneeId !== undefined) {
        if (assigneeId !== null) {
          const isMember = await ProjectMember.findOne({ projectId, userId: assigneeId });
          if (!isMember) {
            return res.status(400).json({ error: 'Assignee must be a project member.' });
          }
        }
        task.assigneeId = assigneeId;
      }

      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
    }

    await task.save();

    const fullTask = await Task.findById(task._id)
      .populate('assigneeId', 'name email');

    const result = {
      ...fullTask.toObject(),
      id: fullTask._id,
      assignee: fullTask.assigneeId,
      assigneeId: fullTask.assigneeId?._id || null,
    };

    res.json({ message: 'Task updated.', task: result });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating task.' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId, projectId } = req.params;
    const task = await Task.findOne({ _id: taskId, projectId });

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await Task.deleteOne({ _id: task._id });
    res.json({ message: 'Task deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting task.' });
  }
};
