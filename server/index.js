const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const cors = require("cors")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const bcrypt = require('bcrypt');
const multer = require('multer');

const UserDetailsModel = require("./models/UserDetails")
const ChallengeDetailsModel = require("./models/ChallengeDetail")
const CheckpointDetailsModel = require("./models/CheckpointDetail")
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

app.post('/challenge', async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { chName, chFormat, chDeadline, chStakes, chDescription, generateInviteCode } = req.body;

    let challengeData = {
        chName,
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
            chDescription: challenge.chDescription,
            participants: challenge.participants // Directly send the populated participants
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