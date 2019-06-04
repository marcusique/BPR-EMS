const express = require('express'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  LocalStrategy = require('passport-local'),
  methodOverride = require('method-override'),
  flash = require('connect-flash'),
  Employee = require('./models/employee'),
  Notification = require('./models/notification'),
  mongoose = require('mongoose'),
  keys = require('./config/keys'),
  PORT = process.env.PORT || 5000;

//* Routes declaration *//
const clientRoutes = require('./routes/clients'),
  taskRoutes = require('./routes/tasks'),
  employeeRoutes = require('./routes/employees'),
  indexRoutes = require('./routes/index'),
  commentRoutes = require('./routes/comments'),
  notificationRoutes = require('./routes/notifications');

const app = express();
app.use(express.static(__dirname + '/public'));

//* Database connection *//
mongoose.set('useCreateIndex', true);
mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true,
  useFindAndModify: false
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('>>>>>>Connected to the database!<<<<<<');
});
//* Body parser setup *//
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//* View engine setup *//
app.set('view engine', 'ejs');
//* Method override setup *//
app.use(methodOverride('_method'));
//** Flash messages setup **//
app.use(flash());

//* Passport configuration *//
app.use(
  require('express-session')({
    secret: keys.cookieKey,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 }, //30 days
    resave: true,
    rolling: true,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Employee.authenticate()));
passport.serializeUser(Employee.serializeUser());
passport.deserializeUser(Employee.deserializeUser());

app.use((req, res, next) => {
  // let result = function() {
  //   if (
  //     (req.user && req.user.userRole == 'Admin') ||
  //     (req.user && req.user.userRole == 'Manager')
  //   ) {
  //     let res = Notification.find({ isActive: true }).exec();
  //     return res.then(function() {
  //       return res;
  //     });
  //   }
  // };
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.currentUser = req.user;
  // res.locals.hasNewNotifications = result();
  next();
});

//* Using routes *//
app.use('/clients', clientRoutes);
app.use('/employees', employeeRoutes);
app.use('/tasks', taskRoutes);
app.use('/tasks/:id', commentRoutes);
app.use('/notifications', notificationRoutes);
app.use(indexRoutes);

//* 404 Not Found handler *//
app.use((req, res, next) => {
  res.status(404).render('404');
});

app.listen(PORT, () =>
  console.log(`>>>>>>Server is running on port ${PORT}<<<<<<`)
);

//* Export for testing *//
module.exports = app;
