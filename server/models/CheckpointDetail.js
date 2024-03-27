const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CheckpointDetailsSchema = new mongoose.Schema({
    number: Number,
    description: String,
    date: Date,
    
})

// const CheckpointDetailsModel = mongoose.model("checkpointdetails", CheckpointDetailsSchema)

module.exports = CheckpointDetailsSchema;