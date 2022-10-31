const express = require('express');
const app = express();
const port = 3001;

// const bodyParser = require('body-parser');
// app.use(bodyParser.json());

// routing 
const userRoutes = require('./routes/user-routes');

// // CORS
// app.use((req, res, next) => {
// 	res.setHeader('Access-Control-Allow-Origin', '*');
// 	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
// 	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
// 	next();
// });

// routes
app.use('/api/users', userRoutes);

// check server
app.get("/", (req, res) => {
	res.status(200).json({
		message: "server responding - app.ts",
	});
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
	});