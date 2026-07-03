const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const beachSchema = new mongoose.Schema({
  BEACHES: []
}, { timestamps: true });

beachSchema.plugin(mongoosePaginate);

const Beach = mongoose.model('Beach', beachSchema);

module.exports = Beach;
