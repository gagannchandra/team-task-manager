const ProjectMember = require('../models/ProjectMember');

/**
 * Middleware to check if the user is a member of the project
 * and optionally requires a specific role.
 * @param {string|null} requiredRole - 'admin', 'member', or null (any member)
 */
const roleCheck = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.params.id;
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required.' });
      }

      const membership = await ProjectMember.findOne({
        projectId,
        userId: req.user._id,
      });

      if (!membership) {
        return res.status(403).json({ error: 'You are not a member of this project.' });
      }

      if (requiredRole && membership.role !== requiredRole) {
        return res.status(403).json({ error: `Access denied. ${requiredRole} role required.` });
      }

      req.membership = membership;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Server error checking permissions.' });
    }
  };
};

module.exports = roleCheck;
