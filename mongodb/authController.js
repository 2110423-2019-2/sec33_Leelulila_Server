const {
  promisify
} = require('util');
const jwt = require('jsonwebtoken');

const catchAsync = require('../utils/catchAsync');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // if (process.env.NODE_ENV === 'production') {
  //   cookieOptions.secure = true;
  // }

  res.cookie('jwt', token, cookieOptions);

  // Remove the password from the output
  //   user.password = undefined;

  console.log(`User with the following id: ${user._id}`);
  res.status(statusCode).json({ 
    status: 'success',
    message: `User with the following id: ${user._id}`
  });
};

exports.protect = catchAsync(async (req, res, client, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new Error('You are not logged in! Please log in to get access', 401);
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await client
    .db('CUPartTime')
    .collection('Users')
    .findOne({
      _id: decoded.id
    });
  if (!currentUser) {
    throw new Error(
      'The token belonging to this token does no longer exist.',
      404
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};