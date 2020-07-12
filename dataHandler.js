"use strict";
/**
 * 从配置文件中读取期刊文件的目录和元数据模式，读取期刊文件，将期刊拆分为条目，输出至result.json文件。
 * 已经迁移至deno。
 * 
 * 此代码不再作为程序的入口点。
 * 
 * deno的1.1版本修复了无法使用远程ts模块的bug。
 */
import { readFileStr,readJson, writeJson, walk } from "https://deno.land/x/std/fs/mod.ts";
import { join } from "https://deno.land/x/std/path/mod.ts";
import { readConfig, config } from "./configManager.js";
import {logFileWriteError,logFileReadError,debugOutput} from "./utility.js";
/**
 * @property {Array<Object>} index
 */
export var structure={
	index:[],
	data:[]
};

/**
 * 将给定的期刊文本拆分为条目。
 * @param {String} data 期刊的markdown格式文本
 * @returns {Array<Object>}
 */
function parser(data, issueNum) {
	data = data.replace(/<br>/img, '\n');
	let num = 0;
	let res = [];
	let tag = "";
	let lines = data.split(/\n\s*\n/);
	function Item() {
		this.content = [];
		this.images = [];
		this.issueNum = issueNum;
		this.id = issueNum + "-" + num;
	}
	res.additem = function (item) {
		item.tag = tag;
		item.markdown = item.content.join("\n\n");
		delete item.content;
		res.push(item);
		num++;
	};
	let item = new Item();

	let istitle = true;
	for (var i in lines) {
		const titleLeader=/^\d+、\s?|#+\s/;
		let curline = lines[i];
		if (curline.match(titleLeader)) {
			if (!istitle) {
				res.additem(item);
				item = new Item();
			}
			let tagline = curline.match(/^#+ (.+)$/);
			if (tagline) {
				tag = tagline[1];
			}
			curline = curline.replace(titleLeader, '');
			istitle = true;
		}else{
			istitle = false;
		}
		debugOutput("Line :" + "\n\t" +
			"Entry " + item.id + "\n\t" +
			"Title:\t"+istitle + "\n\t" +
			"before:\n\t\t"+curline
		);
		for (i in config.rules) {
			const currule= config.rules[i];
			const arg = RegExp(currule.match).exec(curline);
			if (arg && (currule.title == istitle)) {
				debugOutput("\tMatches Rule " + i);
				switch (currule.type) {
					case "attribute":
						for (let j in currule.attribute) {
							item[currule.attribute[j]] = arg[j];
						}
						break;
					case "list":
						/* console.log("debug begin:\n\t"+
							item[currule.list] + "\n\t" +
							item[currule.list].concat(arg.slice(1)) +"\n" +
							"debug end"
						); */
						item[currule.list] =
							item[currule.list].concat(arg.slice(1));
						break;
				}
				if (currule.remove) {
					curline = curline.replace(arg[0], '');
				}
			}
		}
		debugOutput("\tafter:\n\t\t"+curline);
		if (curline.length > 0) {
			item.content.push(curline);
		}
	}
	res.additem = undefined;
	return res;
}
/**
 * 遍历处理本地所有期刊，更新全局对象。
 * @returns {Promise} 
 */
export async function updateFromLocalIssues() {
	//debugOutput("Started!");
	/* 使用walk函数来遍历目录，检索期刊文章。
	 * 此处使用数组来收集所有的回调函数，并使用Promise来检查所有的异步操作是否都完成。
	 */ 
	let work=[];
	for await (const entry of walk(config.weeklyResponsitry, { match: [/issue-(\d+)/] })) {
		work.push(readLocalIssue(entry.path).catch( logFileWriteError ));
	}
	await Promise.allSettled(work);
	//读完所有文件后保存数据结构
	return writeStructure();
}
/* function postProcess(){
	structure.data.sort((a,b)=>{
		return a.
	})
} */
/**
 * 从给定的文件路径读取并处理本地期刊。
 * @param {String} path 期刊的文件路径
 * @returns {Promise<void>}
 */
export async function readLocalIssue(path) {
	//debugOutput("ping!");
	let [, issueNum] = path.match(/issue-(\d+)/);
	return readFileStr(path).then(
		(data)=>{
			let pRes = parser(data, parseInt(issueNum));

			structure.data = structure.data.concat(pRes);
		}
	).catch( logFileWriteError );
	
}
/** 
 * 将条目结构写入config.output指定的文件名（默认为result.json）
 */
export function writeStructure(){
	let file = join(config.output || 'result.json');
	debugOutput("modifying " + file);
	return writeJson(file, structure, { spaces: 4 }).then(
		() => {
			debugOutput("resFile has been modified");
		}
	).catch( logFileWriteError );
}
export function readStructure(){
	let file = join(config.output || 'result.json');
	debugOutput("reading " + file);
	return readJson(file).then(
		(data)=>{
			structure = data;
		}
	).catch( logFileReadError );
}