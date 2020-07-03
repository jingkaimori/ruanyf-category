'use strict';
/**
 * 此程序将会在本地建立一个服务器，提供用户界面来检索result.json
 * 此程序为整个程序的入口点。
 */
import { readFileStr, exists } from "https://deno.land/x/std/fs/mod.ts";
import { join } from "https://deno.land/x/std/path/mod.ts";
import { ServerRequest, serve } from "https://deno.land/x/std/http/mod.ts";
import { readConfig, config } from "./configManager.js";
import { readStructure, structure, updateFromLocalIssues } from "./dataHandler.js";
import { debugOutput, logGeneralError } from "./utility.js";
/** 
 * 搭建http服务器处理动态请求。
 * deno使用异步迭代器（而非事件机制）响应网络请求。
 * Response和Promise 是全局构造函数
 */
readConfig().then(
	readStructure
).catch(
	() => {
		debugOutput("result.json don't exist,creating one...");
		return updateFromLocalIssues();
	}
).then(main);


async function main() {
	let options = { "port": 20680 };
	const server = serve(options);
	debugOutput("server opened");
	for await (const req of server) {
		//支持静态资源，可由配置文件关闭
		if (/^\/src/.test(req.url) && config.static) {
			staticRespond(req);
		} else {
			dynamicRespond(req);
		}
	}
}
/**
 * 响应网页脚本以fetch方式提交的请求，实现动态交互。
 * @param {ServerRequest} req 
 */
function dynamicRespond(req) {
	if (/^\/load/.test(req.url)) {
		let item = req.url.match(/^\/load\/(.*)\??/)[1];
		//req.headers.get();
		Deno.readAll(req.body).then(
			(data) => {
				let itemContent = "", itemObject = structure.find((ele) => { return ele.id == item; });
				if (itemObject) {
					itemContent = JSON.stringify(itemObject);
				} else {
					itemContent = item;
				}
				/** @var {Response} res */
				let res = {
					body: itemContent,
					headers : new Headers({
						"Content-Type": "application/json;charset=utf-8"
					})
				};
				return req.respond(res);
			}
		);
	}
}
/**
 * 静态服务器响应函数，可由nginx配置文件代替
 * @param {ServerRequest} req 
 */
function staticRespond(req) {
	let fileName = join(".", req.url);
	exists(fileName).then(
		(isExist) => {
			if (isExist) {
				return readFileStr(fileName);
			} else {
				let status = new Error("file not found");
				status.name = "NotFound";
				return Promise.reject(status);
			}
		}
	).then(
		(file) => {
			let type = (config.mineType[req.url.match(/\.([^.]*)$/)[1]] || "text") + "; charset=utf-8";
			/** 设定返回文档的MIME类型
			 * @var {Response} fileRes */
			let fileRes = { 
				body: file, 
				headers: new Headers({
					"Content-Type": type
				})
			};

			return req.respond(fileRes);
		}
	).catch(
		(err) => {
			let errRes = { body: "" };//config.errPage
			switch (err.name) {
				case "NotFound":
					errRes.body = "file not found";
					errRes.status = 404;
					break;
				default:
					errRes.body = "internal server error";
					errRes.status = 500;
					logGeneralError(err);
			}
			return req.respond(errRes);
		}
	);
}