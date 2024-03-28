const mongoose = require('mongoose');

const BlogpostSchema = new mongoose.Schema({
    username: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true });

const BlogpostDetailModel = mongoose.model('BlogPost', BlogpostSchema);

module.exports = BlogpostDetailModel;
