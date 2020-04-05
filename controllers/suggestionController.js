const { mongo } = require('../server');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createTFvector = catchAsync(async () => {
  TFvec = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  await mongo
    .db('CUPartTime')
    .collection('Users')
    .updateMany(
      {},
      {
        $set: {
          TFvector: TFvec,
        },
      }
    );
  // console.log('done')
});

exports.addTFvector = catchAsync(async (email, addVector) => {
  const currentUser = await mongo.db('CUPartTime').collection('Users').findOne({
    email,
  });
  if (currentUser) {
    let TFvec = currentUser.TFvector;
    for (i = 0; i < TFvec.length; i++) {
      TFvec[i] += addVector[i];
    }
    await mongo
      .db('CUPartTime')
      .collection('Users')
      .updateOne(
        {
          email,
        },
        {
          $set: {
            TFvector: TFvec,
          },
        }
      );
  } else {
    return new AppError('Not found user in DB.', 404);
  }
});
