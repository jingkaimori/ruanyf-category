"use strict";
/**
 * 从配置文件中读取期刊文件的目录和元数据模式，读取期刊文件，将期刊拆分为条目，输出至result.json文件。
 * 已经迁移至deno。
 * 
 * 此代码不再作为程序的入口点。
 * 
 * deno的1.1版本修复了无法使用远程ts模块的bug。
 */
import { readFileStrSync, writeJson, walk } from "https://deno.land/x/std/fs/mod.ts";
import { join } from "https://deno.land/x/std/path/mod.ts";
import { readConfig, config } from "./configManager.js";

function debugOutput(mesg) {
	if(config.debug){
		console.log(mesg);
	}
}
/**
 * 将期刊拆分为条目。
 * @param {String} data 期刊的markdown格式文本
 * @returns {object}
 */
function parser(data, issueNum) {
	data = data.replace(/<br>/img, '\n');
	let num = 0;
	let res = [];
	let tag = "";
	let lines = data.split(/\n{2,}/);
	function Item() {
		num++;
		this.content = [];
		this.images = [];
		this.issueNum = issueNum;
		this.id = issueNum + "-" + num;
	}
	Item.prototype.push = function () {
		this.tag = tag;
		res.push(this);
	};
	let item = new Item();

	let istitle = true;
	for (var i in lines) {
		const titleLeader=/^\d+、\s?|#+\s/;
		let curline = lines[i];
		if (curline.match(titleLeader)) {
			if (!istitle) {
				item.push();
			}
			item = new Item();
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
	return res;
}

async function readLocalIssues() {
	console.log("Started!");
	let res = [];
	// console.log('***' + JSON.stringify(config));

	/** 
	 * 使用walk函数来遍历目录，检索期刊文章。 
	 * 读完所有文件后写入result.json
	 */
	for await (const entry of walk(config.weeklyResponsitry, { match: [/issue-(\d+)/] })) {
		try {
			//console.log("ping!");

			let [, issueNum] = entry.path.match(/issue-(\d+)/);
			let data = readFileStrSync(entry.path);
			let pRes = parser(data, parseInt(issueNum));

			res = res.concat(pRes);
		} catch (err) {
			if (typeof err == SyntaxError) {
				console.error(new Error(err + "is not found or invalid"));
			} else {
				console.error(err);
			}
		}
	}
	let resFile = join(config.output || 'result.json');
	debugOutput("modifying " + resFile);
	return writeJson(resFile, res, { spaces: 4 }).then(
		() => {
			debugOutput("resFile has been modified");
		},
		(err) => {
			console.log("resFile cannot be wrote");
		}
	).catch(
		(err) => {
			console.log("Error!\n\t" + err);
		}
	);
}
export {readLocalIssues};