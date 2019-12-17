const Airshit = require('../models/Airshit');

/**
 * Make any changes you need to make to the database here
 */
async function up () {
  await this('Airshit').updateMany({}, {
    $set: {
        'VESSELS': []
    }
  }, { multi: true });
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down () {
  await this('Airshit').updateMany({}, {
    $unset: { 'VESSELS': [] }
  });
}

module.exports = { up, down };
