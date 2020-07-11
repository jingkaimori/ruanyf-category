import { config } from "./configManager.js";
/**
 * 此文件内集成了一批工具函数
 * - 错误处理
 * - 调试信息输出
 */
/**
 * 捕获一般错误，用作promise的异常回调函数
 * 使用原始的err对象来保存错误发生时的栈轨迹
 * @param {*} err 捕获的错误对象
 */
export function logGeneralError(err){
	console.error(err);
	return Promise.reject(err);
}
/**
 * 捕获读文件时产生的错误，用作promise的异常回调函数
 * 使用原始的err对象来保存错误发生时的栈轨迹
 * @param {*} err 捕获的错误对象
 */
export function logFileReadError(err){
	if (err.name == "NotFound") {
		err.message = "File not found or cannot be read";
	}
	console.error(err);
	return Promise.reject(err);
}
/**
 * 捕获写文件时产生的错误，用作promise的异常回调函数
 * 使用原始的err对象来保存错误发生时的栈轨迹
 * @param {*} err 捕获的错误对象
 */
export function logFileWriteError(err){
	if (err.name == "NotFound") {
		err.message = "File not found or cannot be wrote";
	}
	console.error(err);
	return Promise.reject(err);
}
export function debugOutput(mesg) {
	if(config.debug){
		console.log(mesg);
	}
}
export function getUrlParam(url){
	let domainPattern = /^(?<schema>\w*):\/\/(?<domain>[0-9A-Za-z.-]+)?(:(?<port>[0-9]+))?(?<path>\/[0-9a-zA-Z%+-~._\/]*)(\?(?<params>.*))?$/;
	let domainRes=domainPattern.exec(url);
	let res =  domainRes.groups;
	res.query = {};
	let paramPattern = /&?(?<name>[0-9a-zA-Z%+-~._]+)=(?<value>[0-9a-zA-Z%+-~._]*)/y;
	let paramRes = paramPattern.exec(res.params);
	while(paramRes){
		let name = decodeURIComponent(paramRes.groups.name);
		let value = decodeURIComponent(paramRes.groups.value);
		res.query[name]=value;
		paramRes = paramPattern.exec(res.params);
	}
	delete res.params;
	return res;
}