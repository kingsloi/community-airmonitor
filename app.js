/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const moment = require('moment');
const mongoose = require('mongoose');
const passport = require('passport');
const sass = require('node-sass-middleware');
const multer = require('multer');
const _ = require('lodash');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

/**
 * Controllers (route handlers).
 */
const airShirtController = require('./controllers/airshit');

/**
 * API keys and Passport configuration.
 */
// const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true,
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    // Multer multipart/form-data handling needs to occur before the Lusca CSRF check.
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.moment = moment;
  res.locals._ = _;
  res.locals.degeesToRotation = (angle) => {
    return (angle + 180) % 360;
  };
  res.locals.timestampToHuman = (timestamp) => {
    const moment1 = moment.unix(timestamp);
    const moment2 = moment();
    return moment.duration(moment1.diff(moment2)).humanize();
  };
  res.locals.dateTimeToHuman = (datetime) => {
    const moment1 = moment(datetime);
    const moment2 = moment();
    return moment.duration(moment1.diff(moment2)).humanize();
  };
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user
    && req.path !== '/login'
    && req.path !== '/signup'
    && !req.path.match(/^\/auth/)
    && !req.path.match(/\./)) {
    req.session.returnTo = req.originalUrl;
  } else if (req.user
    && (req.path === '/account' || req.path.match(/^\/api/))) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});
app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/inputmask/dist'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/chart.js/dist'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jquery/dist'), { maxAge: 31557600000 }));
app.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', airShirtController.index);
app.get('/past', airShirtController.past);
app.get('/history-and-updates', airShirtController.history);
app.get('/sync', airShirtController.sync);
// app.get('/login', userController.getLogin);
// app.post('/login', userController.postLogin);
// app.get('/logout', userController.logout);
// app.get('/forgot', userController.getForgot);
// app.post('/forgot', userController.postForgot);
// app.get('/reset/:token', userController.getReset);
// app.post('/reset/:token', userController.postReset);
// app.get('/signup', userController.getSignup);
// app.post('/signup', userController.postSignup);
// app.get('/contact', contactController.getContact);
// app.post('/contact', contactController.postContact);
// app.get('/account/verify', passportConfig.isAuthenticated, userController.getVerifyEmail);
// app.get('/account/verify/:token', passportConfig.isAuthenticated, userController.getVerifyEmailToken);
// app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
// app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
// app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
// app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
// app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * API examples routes.
 */
// app.post('/api/clockwork', apiController.postClockwork);
// app.get('/api/foursquare', apiController.getFoursquare);
// app.get('/api/tumblr', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTumblr);
// app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
// app.get('/api/github', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGithub);
// app.get('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTwitter);
// app.post('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postTwitter);
// app.get('/api/instagram', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getInstagram);
// app.get('/api/paypal', apiController.getPayPal);
// app.get('/api/paypal/success', apiController.getPayPalSuccess);
// app.get('/api/paypal/cancel', apiController.getPayPalCancel);
// app.get('/api/lob', apiController.getLob);
// app.get('/api/upload', lusca({ csrf: true }), apiController.getFileUpload);
// app.post('/api/upload', upload.single('myFile'), lusca({ csrf: true }), apiController.postFileUpload);
// app.get('/api/pinterest', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getPinterest);
// app.post('/api/pinterest', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postPinterest);
// app.get('/api/here-maps', apiController.getHereMaps);
// app.get('/api/google-maps', apiController.getGoogleMaps);
// app.get('/api/google/drive', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGoogleDrive);
// app.get('/api/chart', apiController.getChart);
// app.get('/api/google/sheets', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGoogleSheets);
// app.get('/api/quickbooks', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getQuickbooks);

// /**
//  * OAuth authentication routes. (Sign in)
//  */
// app.get('/auth/instagram', passport.authenticate('instagram', { scope: ['basic', 'public_content'] }));
// app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), (req, res) => {
//   res.redirect(req.session.returnTo || '/');
// });
// app.get('/auth/snapchat', passport.authenticate('snapchat'));
// app.get('/auth/snapchat/callback', passport.authenticate('snapchat', { failureRedirect: '/login' }), (req, res) => {
//   res.redirect(req.session.returnTo || '/');
// });
// app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
// app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
//   res.redirect(req.session.returnTo || '/');
// });
// app.get('/auth/github', passport.authenticate('github'));
// app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
//   res.redirect(req.session.returnTo || '/');
// });
// app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets.readonly'], accessType: 'offline', prompt: 'consent' }));
// app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
//   res.redirect(req.session.returnTo || '/');
// });
// app.get('/auth/twitter', passport.authenticate('twitter'));
// app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) => {
//   res.redirect(req.session.returnTo || '/');
// });
// app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
// app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), (req, res) => {
//   res.redirect(req.session.returnTo || '/');
// });

// /**
//  * OAuth authorization routes. (API examples)
//  */
// app.get('/auth/foursquare', passport.authorize('foursquare'));
// app.get('/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/api' }), (req, res) => {
//   res.redirect('/api/foursquare');
// });
// app.get('/auth/tumblr', passport.authorize('tumblr'));
// app.get('/auth/tumblr/callback', passport.authorize('tumblr', { failureRedirect: '/api' }), (req, res) => {
//   res.redirect('/api/tumblr');
// });
// app.get('/auth/steam', passport.authorize('openid', { state: 'SOME STATE' }));
// app.get('/auth/steam/callback', passport.authorize('openid', { failureRedirect: '/api' }), (req, res) => {
//   res.redirect(req.session.returnTo);
// });
// app.get('/auth/pinterest', passport.authorize('pinterest', { scope: 'read_public write_public' }));
// app.get('/auth/pinterest/callback', passport.authorize('pinterest', { failureRedirect: '/login' }), (req, res) => {
//   res.redirect('/api/pinterest');
// });
// app.get('/auth/quickbooks', passport.authorize('quickbooks', { scope: ['com.intuit.quickbooks.accounting'], state: 'SOME STATE' }));
// app.get('/auth/quickbooks/callback', passport.authorize('quickbooks', { failureRedirect: '/login' }), (req, res) => {
//   res.redirect(req.session.returnTo);
// });

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
