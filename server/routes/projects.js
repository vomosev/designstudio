const express = require('express');

const {
  listProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectsController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listProjects);
router.post('/', requireAuth, createProject);
router.patch('/:id', requireAuth, updateProject);
router.delete('/:id', requireAuth, deleteProject);
router.get('/:slug', getProjectBySlug);

module.exports = router;