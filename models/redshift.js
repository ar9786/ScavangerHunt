const mongoose = require('mongoose');

const redshiftSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    type:{ type: String,required:true},
    price:{ type:Number,required:true }
});

module.exports = mongoose.model('Redshift',redshiftSchema);