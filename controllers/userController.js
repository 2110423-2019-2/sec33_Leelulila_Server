const { mongo } = require('../server');
const Counter = require('../models/counterModel');
const { createSendToken } = require('./authController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.signup = catchAsync(async (req, res, next) => {
  // console.log(req);
  const newUser = req.body;
  const sequenceValue = await Counter.getSequenceValue('productid');
  newUser._id = sequenceValue;
  newUser.currentJob = [];
  newUser.pendingJob = [];
  newUser.notification = [];
  newUser.TFvector = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  newUser.wallet = 0;
  newUser.jobOwn = [];
  newUser.blogOwn = [];
  newUser.reviewOwn = [];

  const result = await mongo
    .db('CUPartTime')
    .collection('Users')
    .insertOne(newUser);

  // res.json is in createSendToken
  createSendToken(result.ops[0], 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists && password is correct
  const currentUser = await mongo.db('CUPartTime').collection('Users').findOne({
    email,
  });

  //   await bcrypt.compare(candidatePassword, userPassword);
  if (!currentUser || !(currentUser.password === pass)) {
    res.status(404).json({
      status: 'fail',
      message: 'Incorrect email or password',
    });
    return next(new AppError('Incorrect email or password', 404));
  }
  createSendToken(currentUser, 200, res);
});

exports.findUserById = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id);
  result = await mongo.db('CUPartTime').collection('Users').findOne({
    _id: id,
  });

  if (result) {
    console.log(`Found user(s) with the name '${id}':`);
    res.status(200).json(result);
  } else {
    console.log(`No user found with the name '${id}'`);
    return next(new AppError('Not found user for this id!', 404));
  }
});

exports.getUserByEmail = catchAsync(async (req, res, next) => {
  const email = req.params.email;
  result = await mongo.db('CUPartTime').collection('Users').findOne({
    email,
  });
  //console.log(result);
  if (result) {
    res.status(200).json(result);
  } else {
    console.log(`No user found with the name '${email}'`);
    return next(new AppError('Not found user for this email!', 404));
  }
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  console.log(req.body);
  result = await mongo.db('CUPartTime').collection('Users').updateOne(
    {
      _id: id,
    },
    {
      $set: req.body,
    }
  );

  if (!result) {
    return next(new AppError('Not found this id', 404));
  }

  console.log(`${result.matchedCount} document(s) matched the query criteria.`);
  console.log(`${result.modifiedCount} document(s) was/were updated.`);
  res.status(200).json({
    status: 'success',
    data: {
      user: result,
    },
  });
});
