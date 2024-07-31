const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3000;
const secretKey = 'nishantgupta';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).single('file');

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

app.use(bodyParser.json());

let users = [
    { id: 1, username: 'user1', password: bcrypt.hashSync('password1', 8) },
    { id: 2, username: 'user2', password: bcrypt.hashSync('password2', 8) },
];

let products = [
    { id: 1, name: 'Product 1', price: 100 },
    { id: 2, name: 'Product 2', price: 200 },
];

// Login route to generate JWT
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) return res.status(400).send('Invalid Username or Password');

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) return res.status(400).send('Invalid Username or Password');

    const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
    res.json({ token });
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).send('Access Denied');

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).send('Invalid Token');
        req.user = user;
        next();
    });
};

// Routes
app.get('/products', authenticateToken, (req, res) => {
    res.json(products);
});

app.get('/products/:id', authenticateToken, (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).send('Product not found');
    res.json(product);
});

app.post('/products', authenticateToken, (req, res) => {
    const newProduct = {
        id: products.length + 1,
        name: req.body.name,
        price: req.body.price
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.put('/products/:id', authenticateToken, (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).send('Product not found');

    product.name = req.body.name;
    product.price = req.body.price;
    res.json(product);
});

app.delete('/products/:id', authenticateToken, (req, res) => {
    const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
    if (productIndex === -1) return res.status(404).send('Product not found');

    const deletedProduct = products.splice(productIndex, 1);
    res.json(deletedProduct);
});

// File upload route
app.post('/upload', authenticateToken, (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).send(err);
        }
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }
        res.json({ fileName: req.file.filename, filePath: `/uploads/${req.file.filename}` });
    });
});

// Example third-party API integration (OpenWeather)
const weatherApiKey = 'your_openweather_api_key';

app.get('/weather/:city', authenticateToken, async (req, res) => {
    try {
        const city = req.params.city;
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error fetching weather data');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something went wrong!' });
});

app.use((req, res, next) => {
    res.status(404).send({ message: 'Not Found' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
