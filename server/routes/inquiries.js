'use strict';

const express = require('express');

const {
  createInquiry,
  listInquiries,
  updateInquiryStatus,
} = require('../controllers/inquiriesController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Public: submit a new client inquiry
router.post('/', createInquiry);

// Studio staff only: list inquiries (optional ?status= filter)
router.get('/', requireAuth, listInquiries);

// Studio staff only: update an inquiry's workflow status
router.patch('/:id/status', requireAuth, updateInquiryStatus);

module.exports = router;