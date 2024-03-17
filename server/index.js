const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const session = require("express-session")
const UserDetailsModel = require('./models/UserDetails')
const ChallengeDetailsModel = require("./models/ChallengeDetail")
const http = require("http");
const { Server } = require("socket.io");

const app = express()
app.use(express.json())
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))

app.use(session({
    secret: "IdidnotknowIhadthismuchpower",
    resave : false,
    saveUninitialized : false,
    cookie: { secure: false, httpOnly: true }
}))

const { v4: uuidv4 } = require('uuid');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});


mongoose.connect("mongodb+srv://500096396:48R11d4cbL3iIFpv@zenzone0.d4uvypw.mongodb.net/?retryWrites=true&w=majority&appName=ZenZone0/UserDetails" , 
{ useNewUrlParser: true,
 useUnifiedTopology: true })
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

//mongoose.connect("mongodb+srv://500096396:48R11d4cbL3iIFpv@zenzone0.d4uvypw.mongodb.net/?retryWrites=true&w=majority&appName=ZenZone0/ChallengeSetails")

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

app.post('/challenge',(req,res)=>{

    const { chName, chFormat, chDeadline, chStakes, chDescription, generateInviteCode} = req.body;
    let challengeData = {
        chName, 
        chFormat, 
        chDeadline, 
        chStakes, 
        chDescription
    };

    // Conditionally add an invite code for group challenges
    if (generateInviteCode && chFormat === 'Group') {
        challengeData.inviteCode = uuidv4(); // Generate an invite code
        console.log(challengeData.inviteCode)
    }


    ChallengeDetailsModel.create(challengeData)
    .then(ChallengeDetails => res.json(ChallengeDetails))
    .catch(err => {
        console.error(err); // Log the error to the console for debugging
        res.status(500).json(err); // Use a 500 status code for server errors
    });
})

app.listen(3001, ()=>{
    console.log("server is running")
})