const { mongo } = require('../server');
const notification = require('./notificationController');
const Counter = require('../models/counterModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllBlogs = catchAsync(async (req, res, next) => {
  const result = await mongo
    .db('CUPartTime')
    .collection('Blogs')
    .find({})
    .toArray();
  if (result) {
    console.log('Blog', 'found, returning all blog');
    res.status(200).json(result);
  } else {
    console.log('fail to find blog');
    return next(new AppError('Not found any blogs', 404));
  }
});

exports.createBlog = catchAsync(async (req, res, next) => {
  const newBlog = req.body;
  const sequenceValue = Counter.getSequenceValue('blogid');
  newBlog._id = sequenceValue;
  newBlog.timestamp = Date.now();
  newBlog.comments = [];
  newBlog.comment_seq = 0;

  const result = await mongo
    .db('CUPartTime')
    .collection('Blogs')
    .insertOne(newBlog);
  await mongo
    .db('CUPartTime')
    .collection('Users')
    .updateOne(
      {
        email: newBlog.WriterEmail,
      },
      {
        $push: {
          blogOwn: sequenceValue,
        },
      }
    );
  if (result) {
    console.log('blog created with id', sequenceValue);
    res.status(201).json(result);
    // res.json("blog created with id: " + sequenceValue);
  } else {
    console.log('fail to create blog');
    return next(new AppError('Fail to create a blog.', 404));
  }
});

exports.getBlog = catchAsync(async (req, res, next) => {
  const _id = parseInt(req.params.id);
  const result = await mongo.db('CUPartTime').collection('Blogs').findOne({
    _id,
  });
  if (result) {
    console.log('Blog', _id, 'found, returning blog');
    res.status(200).json(result);
  } else {
    console.log('fail to find blog');
    // res.json(`fail to find blog ${_id}`)
    return next(new AppError('Can not get this blog with this id.', 404));
  }
});

exports.editBlog = catchAsync(async (req, res, next) => {
  const _id = parseInt(req.params.id);
  const newContent = req.body;
  const result = await mongo.db('CUPartTime').collection('Blogs').updateOne(
    {
      _id,
    },
    {
      $set: newContent,
    }
  );
  if (result) {
    console.log('job', _id, 'updated');
    res.status(200).json(result);
  } else {
    console.log('fail to delete');
    return next(new AppError('Not found this blog with id', 404));
  }
});

exports.deleteBlog = catchAsync(async (req, res, next) => {
  const _id = parseInt(req.params.id);
  const result = await mongo.db('CUPartTime').collection('Blogs').deleteOne({
    _id,
  });
  if (result) {
    console.log('job', _id, 'deleted');
    res.status(204).json();
  } else {
    console.log('fail to delete');
    return next(new AppError('Not found this blog with id', 404));
  }
});

// Comments Controller
exports.getAllComments = catchAsync(async (req, res, next) => {
  const blogId = parseInt(req.params.id);
  const result = await mongo.db('CUPartTime').collection('Blogs').findOne({
    _id: blogId,
  });
  if (result) {
    console.log('job', blogId, 'found, returning comments');
    res.status(200).json(result.comments);
  } else {
    console.log('fail to find');
    return next(new AppError('Can not found with this blog id.', 404));
  }
});

exports.postComment = catchAsync(async (req, res, next) => {
  const blogId = parseInt(req.params.id);
  const payload = req.body;
  const currentBlog = await mongo.db('CUPartTime').collection('Blogs').findOne({
    _id: blogId,
  });
  const cid = currentBlog.comment_seq;
  await mongo
    .db('CUPartTime')
    .collection('Blogs')
    .updateOne(
      {
        _id: blogId,
      },
      {
        $inc: {
          comment_seq: 1,
        },
      }
    );

  payload.cid = cid;
  payload.timestamp = Date.now();
  const result = await mongo
    .db('CUPartTime')
    .collection('Blogs')
    .updateOne(
      {
        _id: blogId,
      },
      {
        $push: {
          comments: payload,
        },
      }
    );
  if (result) {
    payload = {
      timestamp: Date.now(),
      string: 'You have new comment',
      status: 0,
      BlogId: blogId,
    };
    //console.log(cid)
    await notification.notifyPayload([currentBlog.Employer], payload);
    console.log('comment', cid, 'added');
    // res.json(`${result.modifiedCount} commented`)
    res.status(201).json(result);
  } else {
    console.log('fail to comment');
    // res.json(`fail to comment ${blogId}`)
    return next(new AppError('Fail to comment on this blog.', 404));
  }
});

exports.getComment = catchAsync(async (req, res, next) => {
  const blogId = parseInt(req.params.id);
  const payload = req.body;
  const cid = payload.cid;
  delete payload.cid;
  let result = await mongo.db('CUPartTime').collection('Blogs').findOne({
    _id: blogId,
  });
  let result_comment = '';
  result.comments.forEach(function (comment) {
    if (comment.cid == cid) result_comment = comment;
  });
  if (result_comment) {
    console.log('job', blogId, 'found, returning comment');
    res.status(200).json(result_comment);
  } else {
    console.log('fail to find');
    // res.json(`fail to find blog ${blogId}`)
    return next(new AppError('Can not get this comment by id.', 404));
  }
});

exports.editComment = catchAsync(async (req, res, next) => {
  const blogId = parseInt(req.params.id);
  const payload = req.body;
  const cid = payload.cid;
  delete payload.cid;
  const result = await mongo
    .db('CUPartTime')
    .collection('Blogs')
    .updateOne(
      {
        _id: blogId,
        'comments.cid': cid,
      },
      {
        $set: {
          'comments.$.msg': payload.msg,
        },
      }
    );
  if (result.modifiedCount > 0) {
    console.log('comment', cid, 'edited');
    // res.json(`${result.modifiedCount} edited`)
    res.status(200).json(result);
  } else {
    console.log('fail to edit comment');
    // res.json(`fail to edit comment ${blogId}`)
    return next(new AppError('Can not edit this comment.', 404));
  }
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const blogId = parseInt(req.params.id);
  const payload = req.body;
  const cid = payload.cid;
  delete payload.cid;
  const result = await mongo
    .db('CUPartTime')
    .collection('Blogs')
    .updateOne(
      {
        _id: blogId,
      },
      {
        $pull: {
          comments: {
            cid,
          },
        },
      }
    );
  if (result.modifiedCount > 0) {
    console.log('comment', cid, 'deleted');
    // res.json(`${result.modifiedCount} deleted`)
    res.status(204).json();
  } else {
    console.log('fail to edit deleted');
    // res.json(`fail to edit deleted ${blogId}`)
    return next(new AppError('Fail to delete this comment', 404));
  }
});
