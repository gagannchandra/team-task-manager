const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', auth, projectController.createProject);
router.get('/', auth, projectController.getProjects);
router.get('/:id', auth, roleCheck(), projectController.getProject);
router.post('/:id/members', auth, roleCheck('admin'), projectController.addMember);
router.delete('/:id/members/:userId', auth, roleCheck('admin'), projectController.removeMember);

module.exports = router;
