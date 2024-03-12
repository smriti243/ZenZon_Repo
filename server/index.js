const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const UserDetailsModel = require('./models/UserDetails')

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb+srv://500096396:48R11d4cbL3iIFpv@zenzone0.d4uvypw.mongodb.net/?retryWrites=true&w=majority&appName=ZenZone0/UserDetails")

app.post('/login', (req,res) => {
    if(!req.body.email) {
        return res.status(400).json({message:"Email is required"})
    }
    const {email, password} = req.body;
    UserDetailsModel.findOne({email:req.body.email.toLowerCase()})
  .then(user => {
   if (user){
    if (user.password === password){
        res.json("Success")
    }
    else{
        res.json("Wrong password")
    }
   }
   else{
       res.json("User not found")
   }
  })
})

app.post('/signup',(req,res)=>{
    UserDetailsModel.create(req.body)
    .then(UserDetails => res.json(UserDetails))
    .catch(err => res.json(err))
})

app.listen(3001, ()=>{
    console.log("server is running")
})