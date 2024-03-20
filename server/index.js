const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
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
    cookie: { secure: false,maxAge: 3600 * 24 *1000}
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

// Assuming express setup and necessary imports are done

app.get('/api/challenges', async (req, res) => {
    // Check if the session exists and has the userId stored
    if (!req.session || !req.session.user || !req.session.user.id) {
        console.log('Unauthorized access attempt to /api/challenges');
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        // Retrieve challenges created by the logged-in user
        const challenges = await ChallengeDetailsModel.find({
            createdBy: req.session.user.id
        }).exec();

        // If no challenges found, you could choose to return an empty array or a message
        if (!challenges.length) {
            console.log(`No challenges found for user ${req.session.user.id}`);
            return res.status(404).json({ message: "No challenges found" });
        }

        // Return the found challenges
        console.log(`Found ${challenges.length} challenges for user ${req.session.user.id}`);
        return res.json(challenges);
    } catch (err) {
        // Log the error and return a server error response
        console.error(`Error fetching challenges for user ${req.session.user.id}:`, err);
        return res.status(500).json({ message: 'Failed to fetch challenges', error: err.message });
    }
});

app.use(express.static(path.join(__dirname, 'build'))); // Serve static files from the React app build directory

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html')); // Always return the main index.html, so react-router renders the route in the client
});


app.listen(3001, ()=>{
    console.log("server is running")
})