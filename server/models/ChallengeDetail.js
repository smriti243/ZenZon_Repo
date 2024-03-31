const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ChallengeDetailsSchema = new mongoose.Schema({
    chName: String,
    chFormat: String,
    chDeadline: Date,
    chStakes: String,
    chDescription: String,
    inviteCode : {type: String, unique: true, sparse: true},
    createdBy :{type: Schema.Types.ObjectId, ref: 'User', required: true}
})

const ChallengeDetailsModel = mongoose.model("challengedetails", ChallengeDetailsSchema)

module.exports = ChallengeDetailsModel