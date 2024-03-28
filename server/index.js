const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const cors = require("cors")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const UserDetailsModel = require('./models/UserDetails')
const ChallengeDetailsModel = require("./models/ChallengeDetail")
const CheckpointDetailsSchema = require("./models/CheckpointDetail")
const VotingDetailsModel = require("./models/VotingDetails")
const BlogpostDetailModel = require("./models/BlogpostDetail"); // Adjust the path according to your structure
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
    path: '/socket.io',
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
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
            req.session.user = { id: user._id, email: user.email, username: user.username }; // Save user info in session
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

// Add this endpoint to your server-side code
app.get('/api/session', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    // Assuming the user's ID is stored in the session under 'user.id'
    const userId = req.session.user.id;
    res.json({ userId });
});

// Add this endpoint to your Express app
// Inside your /api/submitVote endpoint

app.post('/api/submitVote', async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { userId, vote } = req.body;

    try {
        const existingVote = await VotingDetailsModel.findOne({ userId });

        if (existingVote) {
            return res.status(409).json({ message: "You have already voted" });
        }

        await VotingDetailsModel.create({ userId, vote });

        // Calculate the updated vote counts
        const yesVotesCount = await VotingDetailsModel.countDocuments({ vote: 'yes' });
        const noVotesCount = await VotingDetailsModel.countDocuments({ vote: 'no' });

        // Emit the updated vote counts to all clients
        io.emit('voteUpdate', { yes: yesVotesCount, no: noVotesCount });

        res.json({ message: "Vote submitted successfully" });
    } catch (error) {
        console.error('Failed to submit vote:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

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

app.post('/submit-blog-post', async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { content } = req.body;
    const username = req.session.user.username; // Assuming the username is stored in the session

    try {
        const newBlogPost = await BlogpostDetailModel.create({ username, content });
        io.emit('newBlogPost', { message: 'New blog post submitted' }); // Emit an event to all clients
        res.status(201).json(newBlogPost);
    } catch (error) {
        console.error('Failed to submit blog post:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// In your server-side code
app.get('/fetch-blog-posts', async (req, res) => {
    try {
        const blogPosts = await BlogpostDetailModel.find({}).sort({createdAt: -1}); // Sort by createdAt in descending order
        res.json(blogPosts);
    } catch (error) {
        console.error('Failed to fetch posts:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// app.use(express.static(path.join(__dirname, 'build'))); // Serve static files from the React app build directory

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html')); // Always return the main index.html, so react-router renders the route in the client
// });


server.listen(3001, ()=>{
    console.log("server is running")
})