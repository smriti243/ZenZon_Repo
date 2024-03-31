const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ChallengeDetailsModel = require('./ChallengeDetail')

const CheckpointDetailsSchema = new mongoose.Schema({
    number: Number,
    description: String,
    date: Date,
    challenge: { type: Schema.Types.ObjectId, ref: 'ChallengeDetailsModel', required: true }
})

const CheckpointDetailsModel = mongoose.model("checkpointdetails", CheckpointDetailsSchema)

module.exports = CheckpointDetailsModel;