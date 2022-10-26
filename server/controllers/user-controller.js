// const { v4: uuidv4 } = require('uuid');
// const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const User = require('../models/user-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//reset password
const crypto = require('crypto');
//sendgrid
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// get all users
const getUsers = async (req, res, next) => {
	const queryResult = await model.getUsers();
	res.send(queryResult);
};
exports.getUsers = getUsers;

// show a user 
const getUserById = async (req, res, next) => {
	const userId = req.params.userId;

};
exports.getUserById = getUserById;

// update a user
const updateUser = async (req, res, next) => {
	const userId = req.params.userId;
	const { firstName, lastName, address, email } = req.body;

};
exports.updateUser = updateUser;

// delete a user
const deleteUser = async (req, res, next) => {
	const userId = req.params.userId;
};
exports.deleteUser = deleteUser;

//// Registration and Sessions ////

// sign up
const signUp = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(new HttpError('Invalid inputs passed, please check your data.', 422));
	}

	const { firstName, lastName, address, email, password } = req.body;

	// check if user exist
	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError('Signing up failed, please try again later.', 500);
		console.log('[existing user]', error);
		return next(error);
	}

	if (existingUser) {
		const error = new HttpError('User with this email already exists, please login instead.', 422);
		return next(error);
	}

	// password
	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(password, 12);
	} catch (err) {
		const error = new HttpError('Could not create user, please try again.', 500);
		return next(error);
	}

	// create user
	const createdUser = new User({
		firstName,
		lastName,
		location: coordinates,
		email,
		image: image,
		password: hashedPassword,
		address: address,
		activities: []
	});

	//save user
	try {
		await createdUser.save();
	} catch (err) {
		const error = new HttpError('Signing up failed, please try again later.', 500);
		console.log('[user creation]', error);
		return next(error);
	}

	//create token
	let token;
	try {
		token = jwt.sign({ userId: createdUser.id, email: createdUser.email }, process.env.JWT_KEY, {
			expiresIn: '1h'
		});
	} catch (err) {
		const error = new HttpError('Signing up failed, please try again later.', 500);
		return next(error);
	}

	console.log('[SIGNUP] OK');
	res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
};
exports.signUp = signUp;

// login
const login = async (req, res, next) => {
	const { email, password } = req.body;

	let existingUser;

	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError('Logging in failed, please try again later.', 500);
		return next(error);
	}

	//no existing user
	if (!existingUser) {
		const error = new HttpError('Invalid credentials, could not log you in.', 403);
		return next(error);
	}

	//check password
	let isValidPassword = false;
	try {
		isValidPassword = await bcrypt.compare(password, existingUser.password);
	} catch (err) {
		const error = new HttpError('Could not log you in, please check your credentials and try again.', 500);
		return next(error);
	}

	//password is not valid
	if (!isValidPassword) {
		const error = new HttpError('Invalid credentials, could not log you in.', 403);
		return next(error);
	}

	//check token
	let token;
	try {
		token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, process.env.JWT_KEY, {
			expiresIn: '1h'
		});
	} catch (err) {
		const error = new HttpError('Logging in failed, please try again later.', 500);
		return next(error);
	}

	console.log('[LOGIN] OK');
	res.json({
		userId: existingUser.id,
		email: existingUser.email,
		token: token
	});
};
exports.login = login;

// Send email reset password
const emailResetPassword = async (req, res, next) => {
	const { email } = req.body;
	//ok
	let user;
	try {
		user = await User.findOne({ email: email });
	} catch (err) {
		return next(new HttpError('User could not be found', 500));
	}

	if (!user) {
		return next(new HttpError('Wrong email', 500));
	}

	// if (user.firstName.toLowerCase() === firstName.toLowerCase() && user.lastName.toLowerCase() === lastName.toLowerCase()) {
	// 	console.log("ok");
	crypto.randomBytes(32, async (err, buffer) => {
		if (err) {
			console.log(err)
			return next(new HttpError('Failed to reset password', 500));
		}
		const token = buffer.toString('hex');
		user.resetToken = token;
		user.resetTokenExpiration = Date.now() + 3600000
		await user.save();
		const msg = {
			to: user.email,
			from: 'simon.busch46@gmail.com',
			subject: 'Reset your password',
			html: `<p>Go to this page to reset your password</p> <a href="https://yungo-3b2c0.web.app/reset-password/${token}"> Here :-) </a>`,
		}
		sgMail
			.send(msg)
			.then(() => {
				console.log('Email sent')
			})
			.catch((error) => {
				console.log("smth went wrong in email sending")
				console.error(error)
			})
	})

	// } else {
	// 	return next(new HttpError('Invalid credentials', 500));
	// }

	res.json({ message: 'ok done' })
}
exports.emailResetPassword = emailResetPassword;


// Reset password
const resetPassword = async (req, res, next) => {
	const { password } = req.body;
	const resetToken = req.params.resetToken;

	let user;
	try {
		user = await User.findOne({ resetToken: resetToken, resetTokenExpiration: { $gt: Date.now() } });
	} catch (err) {
		return next(new HttpError('User could not be found', 500));
	}

	//password
	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(password, 12);
	} catch (err) {
		const error = new HttpError('Could not update password, please try again.', 500);
		return next(error);
	}

	user.password = hashedPassword;
	try {
		await user.save();
	} catch (err) {
		console.log(err);
	}

	res.json({ message: 'ok password reseted' })
}
exports.resetPassword = resetPassword;