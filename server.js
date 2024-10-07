const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');

// Enable CORS for your client's origin (http://localhost:3000)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;
const secretKey = 'MySuperSecretKey';

// Middleware for JWT verification
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

let users = [
    {
        id: 1,
        username: 'nithyasree',
        password: '123'
    },
    {
        id: 2,
        username: 'atmakuru',
        password: '456'
    }
];

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let userFound = false;

    for (let user of users) {
        if (username === user.username && password === user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m' });
            res.json({
                success: true,
                err: null,
                token
            });
            userFound = true;
            break;
        }
    }

    if (!userFound) {
        res.status(401).json({
            success: false,
            token: null,
            err: 'Username or password is incorrect'
        });
    }
});

// Protected route (requires JWT)
app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged-in people can see'
    });
});

// Another protected route
app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Settings content that is protected by JWT'
    });
});

// Serve index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware for unauthorized errors
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Unauthorized. Please log in.'
        });
    } else {
        next(err);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Serving port ${PORT}`);
});
