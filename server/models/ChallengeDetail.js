const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserDetailsModel = require('./UserDetails')

const ChallengeDetailsSchema = new mongoose.Schema({
    chName: String,
    chType: String,
    chFormat: String,
    chStartDate: Date,
    chDeadline: Date,
    chStakes: String,
    chDescription: String,
    stakeImagePath: String ,
    chCompletionImage: String,
    chVerdict: Boolean,
    inviteCode : {type: String, unique: true, sparse: true},
    createdBy :{type: Schema.Types.ObjectId, ref: 'userdetails', required: true},
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userdetails' }]


})

const ChallengeDetailsModel = mongoose.model("challengedetails", ChallengeDetailsSchema)

module.exports = ChallengeDetailsModel