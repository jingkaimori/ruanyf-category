'use strict';
/**
 * 此程序将会在本地建立一个服务器，提供用户界面来检索result.json
 */
import {readConfig,config} from "./configManager.js";
/*
未迁移至deno的遗留代码
confManager.readConfig();
let server=http.createServer();
server.addListener('request',function(req){
	let mainPage = fs.readFileSync("index.html");
	req.write(mainPage);
});*/