'use strict';

var config={};
const fs = require('fs');
const path = require('path');
function updateConfig() {
	config.files = [];
	for (let i = 1; i <= 100; i++) {
		config.files.push(path.join(config.weeklyResponsitry,"docs/issue-" + i + ".md"));
	}
	fs.writeFile('config.json', JSON.stringify(config, undefined, 4), function (err) {
		if (err) {
			console.error(new Error("config.json cannot be wrote"));
		} else {
			console.log('config.json  has been modified');
		}
	});
}
function readConfig(){
	try{
		let conftext = fs.readFileSync("config.json");
		config = JSON.parse(conftext.toString("UTF-8"));
		exports.config=config;
		console.log(config);
	} catch (error) {
		if(typeof error== SyntaxError) {
			console.error("config.json is invalid"+error);
		}else{
			console.error(error);
		}
		throw error;
	}
}

exports.readConfig=readConfig;
exports.updateConfig=updateConfig;
//exports.config=config;