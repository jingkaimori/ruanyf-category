'use strict';
/**
 * 此程序将会在本地建立一个服务器，提供用户界面来检索result.json
 * 此程序为整个程序的入口点。
 */
import { readFileStr,exists } from "https://deno.land/x/std/fs/mod.ts";
import {join} from "https://deno.land/x/std/path/mod.ts";
import {serve} from "https://deno.land/x/std/http/mod.ts";
import {readConfig,config} from "./configManager.js";
/** 
 * 搭建http服务器处理动态请求。
 * deno使用异步迭代器（而非事件机制）响应网络请求。
 * Response和Promise 是全局构造函数
 */
// jshint -W083 
readConfig().then(
	async ()=>{
		let options={"port":20680};
		const server = serve(options);
		for await (const req of server) {
			//支持静态资源，可由配置文件关闭
			if(/^\/src/.test(req.url) ){
				let fileName=join(".",req.url);
				exists(fileName).then(
					(isExist) => {
						if(isExist){
							return readFileStr(fileName);
						}else{
							let status=new Error("file not found");
							status.name="404";
							return Promise.reject(status);
						}
					}
				).then(
					// 
					(file) => {
						let fileRes={body:file};
						return req.respond(fileRes);
					}
				).catch(
					(err)=>{
						let errRes={body:"file not found"};//config.errPage
						switch(err.name){
							case "404":
								errRes.status=404;
								break;
							default:
								errRes.status=500;
						}
						return req.respond(errRes);
					}
				);
			}else if(req.url == "/load"){
				//req.headers.get();
				Deno.readAll(req.body).then(
					(data)=>{
						//var res=;
						return req.respond({ body:req.url });
					}
				);
			}
		}
	}
);