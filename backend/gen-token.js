const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign({ id: '60d0fe4f5311236168a109ca', role: 'HRAdmin' }, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
console.log(token);
