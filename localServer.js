'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const confManager = require('./configManager');

confManager.readConfig();
let server=http.createServer();
server.addListener('request',function(req){
	let mainPage = fs.readFileSync("index.html");
	req.write(mainPage);
});