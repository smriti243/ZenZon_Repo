const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserDetails', // Assuming this is your user model name
    required: true
  },
  vote: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const VotingDetailsModel = mongoose.model('Vote', voteSchema);

module.exports = VotingDetailsModel
