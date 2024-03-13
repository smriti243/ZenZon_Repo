const mongoose = require('mongoose')

const ChallengeDetailsSchema = new mongoose.Schema({
    chName: String,
    chFormat: String,
    chDeadline: Date,
    chStakes: String,
    chDescription: String
})

const ChallengeDetailsModel = mongoose.model("challengedetails", ChallengeDetailsSchema)

module.exports = ChallengeDetailsModel