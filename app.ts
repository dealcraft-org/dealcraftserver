import {server} from "./bin/www";

var createError = require('http-errors');
var express = require('express');
export {}
var path = require('path');
var cookieParser = require('cookie-parser');
const loggerHttp = require('morgan');

// var indexRouter = require('./api-routes/index');
// var usersRouter = require('./api-routes/users');
// var assetRouter = require('./api-routes/handlers/asset');
// var queryEngine = require('./api-routes/queryEngineRoute');
// var authRouter = require('./api-routes/auth');
// var app = express();
// view engine setup
// if (server)
// server.route({
//     method: 'GET',
//     path:'/hello',
//     handler: (request, h) => {
//
//         return 'Hello World!';
//     }
// });

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');



// app.use(loggerHttp('dev'));
// app.use(express.json());
// app.use(express.urlencoded({extended: false}));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
// const swaggerDocument = require('./swagger.json');
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// app.use('/getremotedata', assetRouter)
// app.use('/queryEngine', queryEngine)
// app.use('/auth', authRouter)
// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     next(createError(404));
// });

// error handler
// app.use(function (err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
// });
//
// module.exports = app;
