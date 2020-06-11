'use strict';
/**
 * 读取、修改配置文件。配置文件config.json映射到config对象。
 * 已经迁移至deno。
 * deno的1.1版本已经修复了外部依赖错误。
 */
var config={
	
};
import {readJson,writeJson} from "https://deno.land/x/std/fs/mod.ts";
//import {join} from "../deno/std/path/mod.ts";

/** 该函数不再生成文件名。 */
function updateConfig() {
	
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
	return new Promise(function(resolve,reject){
		readJson("./config.json").then(
			(data)=>{
				config =data;
				//console.log(data);
				resolve();
			},
			(error) =>{
				console.log("error occured!");
				if(typeof error== SyntaxError) {
					console.error("config.json is invalid"+error);
				}else{
					console.error(error);
				}
				reject(error);
			}
		);
	});
	
}

export {readConfig,updateConfig,config};