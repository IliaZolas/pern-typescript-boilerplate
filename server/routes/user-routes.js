const express = require('express');
const router = express.Router();

const userController = require('../controllers/user-controller');

// index
router.get('/', userController.getUsers);

// show
router.get('/:userId', userController.getUserById);

// create user
router.post('/signup',userController.signUp);

// update
router.patch('/:userId', userController.updateUser);

// delete
router.delete('/:userId', userController.deleteUser);

// login
router.post('/login', userController.login);

// reset password
router.post('/email-reset', userController.emailResetPassword);

// Send email reset
router.post('/reset-password/:resetToken', userController.resetPassword);

module.exports = router;