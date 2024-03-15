const mongoose = require('mongoose')

const ChallengeDetailsSchema = new mongoose.Schema({
    chName: String,
    chFormat: String,
    chDeadline: Date,
    chStakes: String,
    chDescription: String,
    invideCode: {type : String, unique : true},
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
})

const ChallengeDetailsModel = mongoose.model("challengedetails", ChallengeDetailsSchema)

module.exports = ChallengeDetailsModel