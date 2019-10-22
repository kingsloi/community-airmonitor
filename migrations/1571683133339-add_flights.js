const Airshit = require('../models/Airshit');

/**
 * Make any changes you need to make to the database here
 */
async function up () {
  await this('Airshit').updateMany({}, {
    $set: {
        'FLIGHTS': {
            ORD: [],
            MDW: [],
            GYY: []
        }
    }
  }, { multi: true });
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down () {
  await this('Airshit').updateMany({}, {
    $unset: { 'FLIGHTS': {} }
  });
}

module.exports = { up, down };
