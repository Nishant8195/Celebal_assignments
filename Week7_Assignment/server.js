const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;
const secretKey = 'nishantgupta';


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

// Get all products
app.get('/products',authenticateToken, (req, res) => {
    res.json(products);
});

// Get a single product by ID
app.get('/products/:id',authenticateToken, (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).send('Product not found');
    res.json(product);
});

// Create a new product
app.post('/products', authenticateToken, (req, res) => {
    const newProduct = {
        id: products.length + 1,
        name: req.body.name,
        price: req.body.price
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Update an existing product
app.put('/products/:id', authenticateToken, (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).send('Product not found');

    product.name = req.body.name;
    product.price = req.body.price;
    res.json(product);
});

// Delete a product
app.delete('/products/:id', authenticateToken, (req, res) => {
    const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
    if (productIndex === -1) return res.status(404).send('Product not found');

    const deletedProduct = products.splice(productIndex, 1);
    res.json(deletedProduct);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
