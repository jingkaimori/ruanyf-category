"use strict";
/**
 * 根据配置文件读取期刊文件，将期刊拆分为条目，输出至result.json文件。
 * 已经迁移至deno。
 * 
 * deno的1.1版本修复了无法使用远程ts模块的bug。
 */
import {readFileStrSync,writeJson,walk} from "https://deno.land/x/std/fs/mod.ts";
import {join} from "https://deno.land/x/std/path/mod.ts";
//var config;
import {readConfig,config} from "./configManager.js";
/**
 * 将期刊拆分为条目。
 * @param {String} data 期刊的markdown格式文本
 * @returns {object}
 */
function parser(data, issueNum) {
	data = data.replace(/<br>/img, '\n');
	let res = [];
	let tag = "";
	let lines = data.split(/\n{2,}/);
	function Item() {
		this.content = [];
		this.images = [];
		this.issueNum = issueNum;
	}
	Item.prototype.push = function () {
		this.tag = tag;
		res.push(this);
	};
	let item = new Item();

	let hasContent = false;
	/**
	 * 
	 * @param {string} str 
	 * @param {RegExp} regex 
	 * @param {Function} func 
	 */
	function findMetadata(str, regex, func) {
		return str.replace(regex, function () {
			//截取参数列表第一项以后的部分。
			var args = Array.prototype.slice.call(arguments, 1);
			func.apply(this, args);
			return '';
		});
	}
	for (var i in lines) {

		let curline = lines[i];
		if (curline.match(/^\d+、|#./)) {
			if (hasContent) {
				item.push();
			}
			hasContent = false;
			item = new Item();
			let titleline = curline.match(/^\d+、(\[(.*)\]\((.*)\))?(（(.*)）)?/);
			if (titleline) {
				if (titleline[2]) {
					item.title = titleline[2];
				} else if (curline.match(/^\d+、(.*)/)[1]) {
					item.title = curline.match(/^\d+、(.*)/)[1];
				} else {
					item.title = '无题';
				}

				if (titleline[3]) {
					item.reference = titleline[3];
				}
				item.lang = titleline[5] || '不明';
			}

			let tagline = curline.match(/^#+ (.+)$/);
			if (tagline) {
				tag = tagline[1];
			}
		} else {
			curline = findMetadata(curline, /!\[.*\]\((.*)\)/,
				function (p1) {
					item.images.push(p1);
				}
			);
			curline = findMetadata(curline,
				/（@\[(.*)\]\(([^)]+)\) 投稿）/,
				function (p1, p2) {
					item.recommender = p1;
					item.issue = p2;
				}
			);
			curline = findMetadata(curline,
				/^-- *\[(.*)\]\((.*)\)$/,
				function (p1, p2) {
					item.title = p1;
					item.reference = p2;
				}
			);
			curline = findMetadata(curline,
				/^-- *(.+)$/,
				function (p1) {
					item.reference = p1;
				}
			);
			if (curline.length > 0) {
				item.content.push(curline);
			}
			hasContent = true;
		}

	}
	return res;
}
readConfig().then(
	async ()=>{
		console.log("Config!");
		let res = [];
		// console.log('***' + JSON.stringify(config));

		/** 
		 * 使用walk函数来遍历目录，检索期刊文章。 
		 * 读完所有文件后写入result.json
		 */
		for await (const entry  of walk(config.weeklyResponsitry,{match:[/issue-(\d+)/]})){
			try{
				console.log("ping!");

				let [, issueNum] = entry.path.match(/issue-(\d+)/);
				let data=readFileStrSync(entry.path);
				let pRes=parser(data, parseInt(issueNum));
				
				res = res.concat(pRes);
			}catch (err){
				console.error(new Error(err + "is not found or invalid"));
			}
		}
		let resFile = join(config.output || 'result.json');
		console.log( "modifying " + resFile);
		return writeJson(resFile, res,  {spaces:4});
	}
).then(
	()=>{
		console.log( "resFile has been modified");
	},
	(err)=>{
		console.log("resFile cannot be wrote");
	} 
).catch(
	(err)=>{
		console.log("Error!\n\t"+err);
	} 
);