const express = require('express');
const router = express.Router({ mergeParams: true });
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', auth, roleCheck('admin'), taskController.createTask);
router.get('/', auth, roleCheck(), taskController.getTasks);
router.put('/:taskId', auth, roleCheck(), taskController.updateTask);
router.delete('/:taskId', auth, roleCheck('admin'), taskController.deleteTask);

module.exports = router;
