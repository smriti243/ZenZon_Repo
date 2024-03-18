const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const session = require("express-session")
const MongoStore = require("connect-mongo")
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
    store: MongoStore.create({mongoUrl: "mongodb+srv://500096396:48R11d4cbL3iIFpv@zenzone0.d4uvypw.mongodb.net/?retryWrites=true&w=majority&appName=ZenZone0"}),
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


mongoose.connect("mongodb+srv://500096396:48R11d4cbL3iIFpv@zenzone0.d4uvypw.mongodb.net/?retryWrites=true&w=majority&appName=ZenZone0" , 
{ useNewUrlParser: true,
 useUnifiedTopology: true })
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

//mongoose.connect("mongodb+srv://500096396:48R11d4cbL3iIFpv@zenzone0.d4uvypw.mongodb.net/?retryWrites=true&w=majority&appName=ZenZone0/ChallengeSetails")

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserDetailsModel.findOne({ email: email.toLowerCase() });
        if (user && user.password === password) {
            req.session.user = { id: user._id, email: user.email }; // Save user info in session
            res.json("Success");
        } else {
            res.status(401).json("Invalid credentials");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json("Server error");
    }
});

app.post('/signup', async (req, res) => {
    try {
        const user = await UserDetailsModel.create(req.body);
        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

app.post('/challenge', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { chName, chFormat, chDeadline, chStakes, chDescription, generateInviteCode } = req.body;
    let challengeData = {
        chName,
        chFormat,
        chDeadline,
        chStakes,
        chDescription,
        createdBy: req.session.user.id // Use user id from session
    };

    if (generateInviteCode && chFormat === 'Group') {
        challengeData.inviteCode = uuidv4();
    }

    try {
        const challengeDetails = await ChallengeDetailsModel.create(challengeData);
        res.json(challengeDetails);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create the challenge', error: err });
    }
});

app.listen(3001, ()=>{
    console.log("server is running")
})