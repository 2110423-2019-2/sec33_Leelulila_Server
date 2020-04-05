const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body and set Limit
app.use(
  express.json({
    limit: '10kb',
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  })
);

// // Routes
// app.use('/api/users', userRouter);
// app.use('/api/reviews', reviewRouter);

// Cookie parser
app.use(cookieParser());

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;