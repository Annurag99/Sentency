const http = require('http');
const open = require('open');
const app = require('./app');
const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port, 'localhost', () => {
    console.log('Launching the browser!');
    open('http://localhost:' + port);
});