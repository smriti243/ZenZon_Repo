const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const cors = require("cors")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const cron = require('node-cron');
//const fetch = require('node-fetch');
//const queryString = require('query-string');
const fetch = require('isomorphic-fetch');

const UserDetailsModel = require("./models/UserDetails")
const ChallengeDetailsModel = require("./models/ChallengeDetail")
const CheckpointDetailsModel = require("./models/CheckpointDetail")
const VotingDetailsModel = require("./models/VotingDetails")
const BlogpostDetailModel = require("./models/BlogpostDetail"); // Adjust the path according to your structure
const http = require("http");
const { Server } = require("socket.io");

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3001/sui';

// Asynchronously import the query-string module
let queryString;

import('query-string').then(module => {
    queryString = module.default;
}).catch(error => {
    console.error('Failed to load the query-string module:', error);
});


// Asynchronously import the query-string module
// let queryString;

// (async () => {
//     queryString = await import('query-string');
// })();


app.use(session({
    secret: "IdidnotknowIhadthismuchpower",
    resave : false,
    saveUninitialized : false,
    store: new MongoStore({
        mongoUrl:"mongodb+srv://500096396:48R11d4cbL3iIFpv@zenzone0.d4uvypw.mongodb.net/?retryWrites=true&w=majority&appName=ZenZone0",
        mongooseConnection: mongoose.connection, // Reuse the existing Mongoose connection
        collection: 'sessions' // Optional, specify the session collection name
    })
    ,
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

// Inside the connection event handler in your WebSocket setup
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', async ({ inviteCode, challengeId }) => {
        console.log(`User with socket ID ${socket.id} is joining room with invite code ${inviteCode} or challenge ID ${challengeId}`);
        const roomId = inviteCode || challengeId;
        if (roomId) {
            socket.join(roomId);
            console.log(`User joined room: ${roomId}`);
            
            // Fetch participants based on challengeId or inviteCode
            const challenge = await ChallengeDetailsModel.findOne({ $or: [{ _id: challengeId }, { inviteCode }] });
            if (challenge) {
                const participantDetails = await UserDetailsModel.find({ '_id': { $in: challenge.participants }}, 'username');
                console.log(`Fetched participants for room ${roomId}:`, participantDetails.map(p => p.username));
                io.to(roomId).emit('updateParticipants', participantDetails.map(p => p.username));
            } else {
                console.log('Challenge not found');
            }
        } else {
            console.log('Error: Neither inviteCode nor challengeId was provided');
        }
    });

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
        if (user) {
            // Compare the provided password with the stored password
            if (password === user.password) {
                req.session.user = { 
                    id: user._id, 
                    email: user.email, 
                    username: user.username, 
                    password: user.password 
                }; // Save user info in session
                console.log('Session data after login:', req.session.user);
                return res.json("Success");
            }
        }
        res.status(401).json("Invalid credentials");
    } catch (err) {
        console.error(err);
        res.status(500).json("Server error");
    }
});

const PPstorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profilePicture');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        cb(null, filename); // No need to replace slashes here, it's handled in the response
    }
});


const upload = multer({ storage: PPstorage });


app.use('/uploads/profilePicture', express.static(path.join(__dirname, 'uploads', 'profilePicture')));

app.get('/api/profilepage', (req, res) => {
    if(!req.session.user){
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Retrieve user from database
    UserDetailsModel.findById(req.session.user.id, 'username email profilePicture password')
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const profilePictureUrl = user.profilePicture ? `http://localhost:3001/${user.profilePicture.replace(/\\/g, '/')}` : null;
            // Send back user details including the password (if necessary)
            res.json({
                id: user._id,
                email: user.email,
                username: user.username,
                profilePicture: profilePictureUrl,
                password: user.password, // Include password here if necessary
            });
        })
        .catch(error => {
            console.error("Error fetching user details:", error);
            res.status(500).json({ message: "Server error", error });
        });
});



// Update user details
app.put('/api/update-userdetails', upload.single('profilePicture'), async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { username, email, password } = req.body;
    try {
        const user = await UserDetailsModel.findById(req.session.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update details
        user.username = username || user.username;
        user.email = email || user.email;
        user.password = password || user.password;
        if (req.file) {
            user.profilePicture = req.file.path.replace(/\\/g, '/');
            console.log("Profile Picture Path:", user.profilePicture);

        }

        await user.save();

        // After user.save() inside your PUT '/api/update-userdetails' endpoint



        // Update session details
        req.session.user = { ...req.session.user, username, email, password: user.password, profilePicture: user.profilePicture };
        console.log(user.profilePicture);

        res.json({
            message: "User details updated successfully",
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                profilePicture: user.profilePicture ? `http://localhost:3001/${user.profilePicture}` : null,
                // Other fields if necessary
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
});



app.post('/signup', async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        
        // Check if the user already exists
        const existingUser = await UserDetailsModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        // const hashedPassword = await bcrypt.hash(password, 10); 

        // Create the user with the hashed password
        const newUser = await UserDetailsModel.create({
            name,
            username,
            email,
            password,
            // Add other user properties if needed
        });

        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err });
    }
});

app.get('/wakatime/authorize', async (req, res) => {
    if (!queryString) {
       //queryString = await import('query-string');

       return res.status(500).send('Server error: query-string module not loaded');
    }
  try{  
    const authorizeUrl = `https://wakatime.com/oauth/authorize?${queryString.stringify({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: 'read_summaries.languages,read_summaries.editors',
    })}`;

    res.redirect(authorizeUrl);
} catch (error) {
    console.error('Error building the authorize URL:', error);
    res.status(500).json({ message: 'Failed to build authorize URL' });
}
});

app.get('/sui', async (req, res) => {
    const { code } = req.query;

    try {
        const response = await fetch('https://wakatime.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: queryString.stringify({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
            }),
        });

        const text = await response.text();  // First get text to check if it's valid JSON or URL-encoded
        try {
            // Try parsing as URL-encoded
            const params = new URLSearchParams(text);
            const accessToken = params.get('access_token');

            if (accessToken) {
                req.session.wakatimeAccessToken = accessToken;
                res.redirect('http://localhost:3000/apiPage');  // Redirect to a success page or another part of your app
            } else {
                throw new Error('No access token received.');
            }
        } catch (err) {
            throw new Error(`Failed to parse response: ${text}`);
        }
    } catch (error) {
        console.error('Token exchange error:', error);
        res.status(500).send(`Internal Server Error: ${error.message}`);
    }
});


app.get('/wakatime/user-summaries', async (req, res) => {
    const accessToken = req.session.wakatimeAccessToken; // Assuming it's stored in the session
    
    // Set up date range: default to the last 7 days if not specified in the query
    const endDate = new Date(); // today's date
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7); // 7 days ago

    // Convert dates to YYYY-MM-DD format
    const format = (date) => date.toISOString().split('T')[0];

    const response = await fetch(`https://wakatime.com/api/v1/users/current/summaries?start=${format(startDate)}&end=${format(endDate)}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).json({ error });
    }

    const data = await response.json();
    res.json(data);
});


app.get('/api/check-wakatime-connection', (req, res) => {
    if (req.session && req.session.wakatimeAccessToken) {
        // Optionally verify the token's validity by making a test API call to WakaTime
        res.json({ isConnected: true });
    } else {
        res.json({ isConnected: false });
    }
});

// Schedule a task to run every day at midnight to check for expired challenges
cron.schedule('0 0 * * *', async () => {
    console.log('Running a daily check for expired challenges.');
    const today = new Date();
    const expiredChallenges = await ChallengeDetailsModel.find({
        chDeadline: { $lt: today },
        stakeImagePath: { $ne: null },
        uploadedToWallOfShame: { $ne: true }
    });

    expiredChallenges.forEach(async (challenge) => {
        challenge.uploadedToWallOfShame = true;
        await challenge.save();
        console.log(`Challenge ${challenge._id} moved to Wall of Shame.`);
    });
});

app.get('/api/wall-of-shame', async (req, res) => {
    try {
        const challenges = await ChallengeDetailsModel.find({ uploadedToWallOfShame: true });
        res.status(200).json(challenges);
    } catch (error) {
        console.error('Failed to fetch challenges for Wall of Shame:', error);
        res.status(500).json({ message: "Server error", error });
    }
});


app.get('/api/running-challenges', async (req, res) => {
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

app.get('/api/running-challenge-details/:challengeId', async (req, res) => {
    const challengeId = req.params.challengeId; // Get challengeId from URL parameters

    try {
        const challenge = await ChallengeDetailsModel.findById(challengeId)
            .populate('participants', 'username email'); // Populating participant details

        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        const checkpoints = await CheckpointDetailsModel.find({ challenge: challengeId });

        res.json({
            challenge,
            checkpoints
        });
    } catch (error) {
        console.error('Error fetching challenge and checkpoints:', error);
        res.status(500).json({ message: "Server error", error });
    }
});

const checkpointImageStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/CheckpointImages');  // Ensure this directory exists or create it
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadCheckpointImage = multer({ storage: checkpointImageStorage });

app.post('/api/upload-checkpoint-progress', uploadCheckpointImage.single('progressImage'), async (req, res) => {
    const checkpointId = req.query.checkpointId;
    if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
    }

    try {
        const checkpoint = await CheckpointDetailsModel.findById(checkpointId);
        if (!checkpoint) {
            console.log(`No checkpoint found with ID: ${checkpointId}`);
            return res.status(404).json({ message: "Checkpoint not found" });
        }

        checkpoint.progressImage = `uploads/CheckpointImages/${req.file.filename}`;
        await checkpoint.save();
        res.status(200).json({ message: "Progress image updated successfully", checkpoint });
    } catch (error) {
        console.error('Failed to update checkpoint:', error);
        res.status(500).json({ message: "Server error", error });
    }
});

const challengeCompleteStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        const dir = 'uploads/ChallengeComplete';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadChallengeComplete = multer({ storage: challengeCompleteStorage });

app.use('/uploads/ChallengeComplete', express.static(path.join(__dirname, 'uploads', 'ChallengeComplete')));

app.post('/api/challenge-complete/:challengeId', uploadChallengeComplete.single('completionImage'), async (req, res) => {
    const { challengeId } = req.params;

    if (!req.file) {
        return res.status(400).json({ message: "No completion image uploaded" });
    }

    try {
        const challenge = await ChallengeDetailsModel.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        challenge.chCompletionImage = `uploads/ChallengeComplete/${req.file.filename}`; // Update challenge with the path of the completion image
        await challenge.save();

        res.json({
            message: 'Challenge completed successfully',
            challenge: {
                id: challenge._id,
                chName: challenge.chName,
                chCompletionImage: challenge.chCompletionImage
            }
        });
    } catch (error) {
        console.error('Error completing challenge:', error);
        res.status(500).json({ message: "Server error", error });
    }
});


app.post('/challenge', async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { chName, chType, chFormat, chDeadline, chStakes, chDescription, generateInviteCode } = req.body;

    let challengeData = {
        chName,
        chType,
        chFormat,
        chDeadline,
        chStakes,
        chDescription,
        createdBy: req.session.user.id, // ID of the user creating the challenge
        participants: [req.session.user.id], // Include the creator as the first participant
    };

    if (generateInviteCode && chFormat === 'Group') {
        challengeData.inviteCode = uuidv4(); // Generate an invite code for group challenges
    }

    try {
        const challengeDetails = await ChallengeDetailsModel.create(challengeData);
        
        // Construct and send the response object
        const responseObject = { 
            challengeId: challengeDetails._id,
            message: 'Challenge created successfully',
        };

        if (challengeData.inviteCode) {
            responseObject.inviteCode = challengeData.inviteCode;
        }

        res.json(responseObject);
    } catch (error) {
        console.error('Error creating challenge:', error);
        res.status(500).json({ message: 'Failed to create the challenge', error: error.message });
    }
});


app.post('/api/join-challenge', async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Unauthorized" }); // Ensure user is logged in
    }

    const userId = req.session.user.id; // Get user ID from session
    const { inviteCode } = req.body;

    try {
        const challenge = await ChallengeDetailsModel.findOne({ inviteCode });

        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        // Check if the user is already a participant
        if (challenge.participants.includes(userId)) {
            return res.status(400).json({ message: "User already a participant" });
        }

        // Add user to participants list and save
        challenge.participants.push(userId);
        await challenge.save();

        // Fetch participant usernames
        const participantUsernames = await UserDetailsModel.find({ _id: { $in: challenge.participants } }, 'username');

        // Construct response data including participant usernames
        const responseData = {
            message: "Joined challenge successfully",
            challengeId: challenge._id,
            participants: participantUsernames.map(user => user.username) // Assuming your UserDetailsModel has a 'username' field
        };

        // Emit an event to the challenge's lobby about the new participant
        io.to(inviteCode).emit('newParticipant', { userId, challengeId: challenge._id });

        res.json(responseData);
    } catch (error) {   
        console.error('Error joining challenge:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// Define the endpoint to submit checkpoint data
app.post('/api/checkpoint', async (req, res) => {
    const { number, description, date, challengeId } = req.body;
  
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    try {
      // Ensure the challenge exists
      const challengeExists = await ChallengeDetailsModel.findById(challengeId);
      if (!challengeExists) {
        return res.status(404).json({ message: "Challenge not found" });
      }
  
      // Create and save the new checkpoint
      const newCheckpoint = new CheckpointDetailsModel({
        number,
        description,
        date,
        challenge: challengeId, // Assuming your CheckpointDetailsModel has a field to reference the challenge
      });
  
      await newCheckpoint.save();
  
      // Optionally, add the checkpoint to the challenge document
      // challengeExists.checkpoints.push(newCheckpoint);
      // await challengeExists.save();
  
      res.status(201).json(newCheckpoint);
    } catch (error) {
      console.error('Error submitting checkpoint:', error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

// Backend endpoint to fetch stakes
app.get('/fetching-stakesvalue', async (req, res) => {
    const { challengeId } = req.query; // Extract challengeId from query parameters
    try {
      const challenge = await ChallengeDetailsModel.findById(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      res.json({ chStakes: challenge.chStakes }); // Send the chStakes value
    } catch (error) {
      console.error('Error fetching challenge details:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  });

  const imageStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/StakeImages');  // Ensure this directory exists
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const ImageStakeupload = multer({ storage: imageStorage });

app.post('/api/stake-image', ImageStakeupload.single('stakeImage'), async (req, res) => {
    const challengeId = req.body.challengeId;
    console.log('Received challengeId:', challengeId); // Confirming challengeId is received
    if (!req.file) {
        console.log('No file received');
        return res.status(400).json({ message: "No file uploaded" });
    }
    console.log('File received:', req.file); // Logging file details

    try {
        const challenge = await ChallengeDetailsModel.findById(challengeId);
        if (!challenge) {
            console.log('No challenge found with ID:', challengeId);
            return res.status(404).json({ message: "Challenge not found" });
        }

        console.log('Challenge before update:', challenge); // Log challenge details before update

        // Check if challenge has a specific field requirement before updating path
        if (challenge.chStakes === 'image') {
            challenge.stakeImagePath = `uploads/StakeImages/${req.file.filename}`;
            console.log('Updated stakeImagePath to:', challenge.stakeImagePath); // Log the new path

            // Attempt to save the updated challenge document
            const updatedChallenge = await challenge.save();
            console.log('Challenge after saving to DB:', updatedChallenge); // Log challenge details after saving
            res.json({ message: 'Challenge updated successfully', challenge: updatedChallenge });
        } else {
            console.log('Challenge stakes type is not Image');
            res.status(400).json({ message: "Challenge stakes type is not set to Image" });
        }
    } catch (error) {
        console.error('Failed to update challenge:', error);
        res.status(500).json({ message: "Server error", error });
    }
});





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
    const { userId, imageId, vote } = req.body;

    if (!userId || !imageId) {
        return res.status(400).json({ message: "Missing parameters" });
    }

    try {
        const foundVote = await VotingDetailsModel.findOne({ userId, imageId });
        console.log('Found Vote:', foundVote);
        if (foundVote) {
            return res.status(409).json({ message: "You have already voted on this image" });
        }


        const newVote = new VotingDetailsModel({
            userId,
            imageId,
            vote
        });
        await newVote.save();
        console.log('New Vote Saved:', newVote);

        // Emit updated vote counts
       // Emit updated vote counts

       console.log('ImageId as received:', imageId);
       console.log('ImageId converted to ObjectId:', mongoose.Types.ObjectId(imageId));
       

const votes = await VotingDetailsModel.aggregate([
    { $match: { imageId: mongoose.Types.ObjectId(imageId) } }, // Ensure matching is done properly
    { $group: { _id: "$vote", count: { $sum: 1 } } }
]);

console.log('Aggregated votes:', votes);

const voteCounts = { yes: 0, no: 0 }; // Default to zero for both options
votes.forEach(vote => {
    voteCounts[vote._id] = vote.count;
});

console.log('Vote counts:', voteCounts);

io.emit('voteUpdate', { imageId, votes: voteCounts });


        res.status(201).json({ message: "Vote recorded successfully" });
    } catch (error) {
        console.error('Error submitting vote:', error);
        res.status(500).json({ message: "Server error", error });
    }
});

app.get('/api/challenge-completion-images', async (req, res) => {
    try {
        const challenges = await ChallengeDetailsModel.aggregate([
            {
                $match: { chCompletionImage: { $ne: null } } // Filter challenges that have a completion image
            },
            {
                $lookup: {
                    from: VotingDetailsModel.collection.name, // Join with the voting details collection
                    let: { imageId: '$_id' }, // Define variable to use in the pipeline
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$imageId', '$$imageId'] // Match votes related to the challenge image
                                }
                            }
                        },
                        {
                            $group: { // Group results by vote type and count them
                                _id: '$vote',
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $project: { // Shape the output to label the vote counts
                                voteType: '$_id',
                                count: 1
                            }
                        }
                    ],
                    as: 'votes' // Output array containing vote results
                }
            },
            {
                $project: { // Shape the final document structure
                    chCompletionImage: 1,
                    votes: 1 // Include the votes array in the output
                }
            }
        ]);

        res.json(challenges);
    } catch (error) {
        console.error('Failed to fetch challenge images:', error);
        res.status(500).json({ message: "Server error", error });
    }
});



// app.post('/api/challenge-details', async (req, res) => {
//     if (!req.session || !req.session.user) {
//         return res.status(401).json({ message: "Unauthorized" });
//     }
//     const { challengeId } = req.body;

//     try {
//         const challenge = await ChallengeDetailsModel.findById(challengeId)
//                               .populate('participants', 'username'); // Ensure 'username' is a valid field in User model
//         if (!challenge) {
//             return res.status(404).json({ message: "Challenge not found" });
//         }
//         // If challenge is found but participants are null, investigate data integrity and model registration
//         res.json({
//             challengeId: challenge._id,
//             // Include other challenge details
//             participants: challenge.participants
//         });// Sends the challenge object with populated participants
//     } catch (error) {
//         console.error('Error fetching challenge details:', error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });


// app.post('/api/challenge-details', async (req, res) => {
//     console.log('Session ID:', req.sessionId);
//     if (!req.session || !req.session.user) {
//         return res.status(401).json({ message: "Unauthorized" });
//     }

//     const { challengeId } = req.body;

//     try {
//         // Find the challenge by ID and populate the 'participants' field
//         const challenge = await ChallengeDetailsModel.findById(challengeId)
//             .populate('participants', 'username') // Assuming your User model has a 'username' field
//             .exec();

//         if (!challenge) {
//             return res.status(404).json({ message: "Challenge not found" });
//         }

//         // Respond with challenge details including participant usernames
//         res.json({
//             challengeId: challenge._id,
//             chName: challenge.chName,
//             chFormat: challenge.chFormat,
//             chDeadline: challenge.chDeadline,
//             chStakes: challenge.chStakes,
//             chDescription: challenge.chDescription,
//             participants: challenge.participants.map(participant => participant.username)
//         });
//     } catch (error) {
//         console.error('Error fetching challenge details:', error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     } 
// });

app.post('/api/challenge-details', async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
        
    }

   // const userId = req.session.user.id;
    const { challengeId } = req.body;

    try {
        // Find the challenge by ID and populate the 'participants' field
        const challenge = await ChallengeDetailsModel.findById(challengeId)
            .populate({path:'participants', 
                       select: 'username'}) // Assuming your User model has a 'username' field
            .exec();

        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        // Respond with challenge details including participant usernames
        res.json({
            challengeId: challenge._id,
            chName: challenge.chName,
            chFormat: challenge.chFormat,
            chDeadline: challenge.chDeadline,
            chStakes: challenge.chStakes,
            createdBy: challenge.createdBy,
            chDescription: challenge.chDescription,
            participants: challenge.participants ,// Directly send the populated participants
            userId: req.session.user.id
        });
    } catch (error) {
        console.error('Error fetching challenge details:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    } 
});

const blogImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/BlogPictures'); // Ensure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const blogUpload = multer({ storage: blogImageStorage });

app.use('/uploads/BlogPictures', express.static(path.join(__dirname, 'uploads', 'BlogPictures')));


app.post('/submit-blog-post', blogUpload.single('image'), async (req, res) => {
    const { content } = req.body; // Text content of the post
    console.log(req.body); // Should log the content
    console.log(req.file); 
    const image = req.file ? `http://localhost:3001/uploads/BlogPictures/${req.file.filename}` : null;

    try {
        const newBlogPost = await BlogpostDetailModel.create({
            username: req.session.user.username, // Assuming the username is stored in the session
            content,
            image
        });
        io.emit('newBlogPost', { message: 'New blog post submitted' }); // Notify all clients
        res.status(201).json(newBlogPost);
    } catch (error) {
        console.error('Failed to submit blog post:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});



// In your server-side code
app.get('/fetch-blog-posts', async (req, res) => {
    try {
        const blogPosts = await BlogpostDetailModel.find({}).sort({createdAt:-1}); // Sort by createdAt in descending order
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