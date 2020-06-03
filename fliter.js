"use strict";
/**
 * 根据配置文件读取期刊文件，将期刊拆分为条目，输出至result.json文件。
 * 已经迁移至deno。
 * 运行时报错：
 * 	error: Uncaught AssertionError: Unexpected skip of the emit.
 * 		at Object.assert ($deno$/util.ts:33:11)
 * 		at compile ($deno$/compiler.ts:1170:7)
 * 		at tsCompilerOnMessage ($deno$/compiler.ts:1338:22)
 * 		at workerMessageRecvCallback ($deno$/runtime_worker.ts:72:33)
 * 		at file:///mnt/E/Source/web(Html+CSS+JavaScript)/deno-test/__anonymous__:1:1
 */
import {readFileStr} from "https://deno.land/x/std/fs/read_file_str.ts";
import {writeJson} from "https://deno.land/x/std/fs/write_json.ts";
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
console.log("Launched!");
try{
	readConfig();


let res = [];
// console.log('***' + JSON.stringify(config));
for (let i in config.files) {

		let srcFile = join(config.weeklyResponsitry,config.files[i]);
		let [, issueNum] = config.files[i].match(/issue-(\d+)/);
		
		readFileStr(srcFile).then(
			(data)=>{
				res = res.concat(parser(data, parseInt(issueNum)));
			},
			(err)=>{
				console.error(new Error(err + "is not found or invalid"));
			}
		);
}

let resFile = join(config.output || 'result.json');

writeJson(resFile, res,  {spaces:4})
.then(
	()=>{
		console.log(resFile + ' has been modified');
	},
	(err)=>{
		console.error(new Error(resFile + " cannot be wrote"));
	} 
);
}catch(e){
	console.log("Error!");
}