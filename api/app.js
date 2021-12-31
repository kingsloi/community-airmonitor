/**
 * Module dependencies.
 */
const express = require('express');
// const compression = require('compression');
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
const cors = require('cors');
const history = require('connect-history-api-fallback');
const cache = require('express-redis-cache')();

var serveIndex = require('serve-index');
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
// app.use(compression());
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
app.use(cors());
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    // Multer multipart/form-data handling needs to occur before the Lusca CSRF check.
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});

app.disable('x-powered-by');

app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/fonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));
app.use('/fonts', express.static(path.join(__dirname, 'public', 'fonts'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
const publicPath = path.resolve(path.join(__dirname, '../', 'client', 'dist'));
app.use(express.static(publicPath, { maxAge: '1y', etag: false }));
app.use('/files', express.static('public/files'), serveIndex('public/files', {
  'icons': true,
  'stylesheet': path.join(__dirname, '../', 'client', 'public', 'directory-listing.css'),
}))

app.get('/currently', cache.route({ expire: 450  }), airShirtController.currently);
app.get('/highs', cache.route({ expire: 86400  }), airShirtController.highs);
app.get('/sync', airShirtController.sync);
app.get('/migrate', airShirtController.migrate);
//app.get('/previous-by-day', cache.route({ expire: 86400  }), airShirtController.past);
//app.get('/airshits/date/:date', cache.route({ expire: 31540000  }), airShirtController.airshitByDate);
//app.get('/airshits/:airshit', cache.route({ expire: 31540000  }), airShirtController.airshit);
app.get('/vessels/photos', cache.route({ expire: 86400  }), airShirtController.getVesselPhotos);
app.get('/vessels/:vessel/photos', cache.route({ expire: 86400  }), airShirtController.searchVesselPhoto);

app.use(history());

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
