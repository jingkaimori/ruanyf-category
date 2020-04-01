'use strict';

var config;
const fs = require('fs');
const path = require('path');
/**
 * 
 * @param {String} data 
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

fs.readFile("config.json", function (fatal, conf) {
	if (fatal) {
		console.error(new Error("config.json is not found or invalid"));
		return;
	}
	config = JSON.parse(conf);
	let res = [];
	for (let i in config.files) {
		let readFile = path.normalize(config.files[i]);
		let [, issueNum] = config.files[i].match(/issue-(\d+)/);
		let data = fs.readFileSync(readFile);
		/* if (err) {
			console.error(new Error(readFile + "is not found or invalid"));
		} */
		res = res.concat(parser(data.toString('UTF-8'), parseInt(issueNum)));
		//console.log('***' + JSON.stringify(res));
	}

	let resFile = path.join(config.output || 'result.json');
	fs.writeFile(resFile, JSON.stringify(res, undefined, 4), function (err) {
		if (err) {
			console.error(new Error(resFile + " cannot be wrote"));
		} else {
			console.log(resFile + ' has been modified');
		}
	});
});

function filesEmulator() {
	let files = [];
	for (let i = 1; i <= 100; i++) {
		files.push("/home/jingkaimori/E/Source/gitproject/weekly/docs/issue-" + i + ".md");
	}
}
