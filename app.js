var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var { connectBinance } = require('./marketDataSource/binance')

var indexRouter = require('./routes/index');
var marketRouter = require('./routes/book')

var app = express();
connectBinance()

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/book', marketRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // send the error page
  res.status(err.status || 500);
  res.send('error');
});

module.exports = app;
