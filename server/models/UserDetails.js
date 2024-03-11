const mongoose = require('mongoose')

const UserDetailsSchema = new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String
})

const UserDetailsModel = mongoose.model("userdetails", UserDetailsSchema)

module.exports = UserDetailsModel