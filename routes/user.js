const express = require('express');
const router = express.Router();
const UsersController = require('../api/controllers/users');


router.post('/signup',UsersController.user_signup);
router.post('/login',UsersController.user_login);
router.post('/reset_password',UsersController.reset_password);
router.delete('/:userID',UsersController.user_delete);


module.exports = router;