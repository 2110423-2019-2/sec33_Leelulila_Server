const { mongo } = require('../server');
const catchAsync = require('../utils/catchAsync');

exports.getSequenceValue = catchAsync(async (sequenceName) => {
  const sequenceValue = await client
    .db('CUPartTime')
    .collection('counters')
    .findOne({
      _id: sequenceName,
    });
  await mongo
    .db('CUPartTime')
    .collection('counters')
    .updateOne(
      {
        _id: sequenceName,
      },
      {
        $inc: {
          sequence_value: 1,
        },
      }
    );
  return sequenceValue;
});
