const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserDetails', // Assuming this is your user model name
    required: true
  },
  imageId: { // Added field to track the image being voted on
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  vote: {
    type: String,
    required: true,
    enum: ['yes', 'no'] // Restrict to 'yes' or 'no' votes
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const VotingDetailsModel = mongoose.model('Vote', voteSchema);

module.exports = VotingDetailsModel;
