'use strict';
/**
 * 读取、修改配置文件。配置文件config.json映射到config对象。
 * 已经迁移至deno。
 * 运行时报错：
 * ```error: No such file or directory (os error 2)```
 * 等待新版本deno
 */
var config={};
import {readJson,join} from "https://deno.land/std/path/mod.ts";
import {writeJson} from "https://deno.land/std/fs/write_json.ts";

function updateConfig() {
	config.files = [];
	for (let i = 1; i <= 100; i++) {
		config.files.push(join(config.weeklyResponsitry,"docs/issue-" + i + ".md"));
	}
	writeJson('config.json', config,  {spaces:4}).then(
		()=>{
			console.log('config.json  has been modified');
		},
		(err) => {
			console.error(new Error("config.json cannot be wrote"));
		} 
	);
}
function readConfig(){
	readJson("./config.json").then(
		(data)=>{
			config =data;
			console.log(data);
		},(error) =>{
			console.log("error1");
			if(typeof error== SyntaxError) {
				console.error("config.json is invalid"+error);
			}else{
				console.error(error);
			}
			throw error;
		}
	);
}

export {readConfig,updateConfig,config};
//exports.config=config;