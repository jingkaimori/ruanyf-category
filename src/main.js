var pageMap={
	"indexPage":{
		path:"/src/about.html",
		hook:[]
	},
	"viewPage":{
		path:"/src/view.html",
		hook:[
			{
				selector:"#jumpButton",
				event:"click",
				listener:"jumpGiven"
			},
			{
				selector:"#beforeButton",
				event:"click",
				listener:"jumpSlibingF"
			},
			{
				selector:"#afterButton",
				event:"click",
				listener:"jumpSlibingL"
			}
		]
	},
	"editPage":{
		path:"/src/edit.html",
		hook:[]
	},
	"searchPage":{
		path:"/src/search.html",
		hook:[]
	},
	"sequencePage":{
		path:"/src/sequence.html",
		hook:[]
	}
};
var curResourceID=0;
/**
 * @interface Hook
 * @property {string} selector
 * @property {string} event
 * @property {string} listener
 */
class Hook {
	get selector(){}
	get event(){}
	get listener(){}
}
/**
 * 使用CSS选择器，为选定的元素注册指定的事件侦听器。
 * 页面框架方法，所有子页面都可用
 * @param {Hook} hook
 */
function registEvent(hook){
	for(let i of document.querySelectorAll(hook.selector)){
		i.addEventListener(hook.event,window[hook.listener]);
	}
}
function toggleEventHandler(e){
	togglePage(e.currentTarget.id);
}
/**
 * 页面框架方法，所有子页面都可用
 * @param {string} id 切换按钮的id，从`pagemap`表中查找页面和相关的事件钩子。
 */
function togglePage(id){
	let item = pageMap[id];
	if(item){
		loadResource(item.path).then(
			(txt)=>{
				document.getElementsByTagName("main")[0].innerHTML=txt;
				for(let i of item.hook){
					registEvent(i);
				}
			}
		);
	}else{
		throw new Error("illegal id");
	}
}
/**
 * 使用get方法加载资源，不携带任何请求体。
 * 页面框架方法，所有子页面都可用
 * @param {string} url 
 */
async function loadResource(url){
	let requestOption={
		method:"GET"
	};
	return fetch(url,requestOption).then(
		(res)=>{
			if(res.ok){
				return res.text();
			}else{
				return Promise.reject(new Error(res.status));
			}
		}
	).catch(
		(err) => {
			switch(err.message){
				case "404":
					console.error("resource" + url + " not found");
					break;
				default:
	
			}
			return Promise.reject(err);
		}
	);
}

function jumpSlibingL(event) {
	curResourceID ++;
	queryItem(curResourceID);
}
function jumpSlibingF(event) {
	curResourceID --;
	queryItem(curResourceID);
}
function jumpGiven(event) {
	curResourceID = document.getElementById("inputBox").value;
	queryItem(curResourceID);
}
/**
 * 
 * @param {String} resourceId
 */
function queryItem(resourceId){
	let requestURL="/load/"+resourceId;
	console.log(requestURL);
	loadResource(requestURL).then(
		(txt)=>{
			let past = document.getElementById("conponent");
			if(past){
				past.remove();
			}

			let item=JSON.parse(txt);
			let fragment=document.getElementById("articleTemplate").content.cloneNode(true);
			fillArticle(item,fragment);

			//console.log(document.getElementsByTagName("main")[0].innerHTML);
			let mainArea=document.getElementsByTagName("main")[0];
			mainArea.appendChild(fragment);
		}
	);
}
/**
 * 向模板元素写内容。
 * @param {Object} item 
 * @param {DocumentFragment} fragment 
 */
function fillArticle(item, fragment) {
	let title = fragment.getElementById("contentTitle");
	title.innerText = item.title;

	let footer = fragment.getElementById("contentBottom");
	footer.insertAdjacentHTML("beforebegin", marked(item.markdown));

	let ref = fragment.getElementById("resourceLink");
	ref.innerText = item.reference;
	ref.setAttribute("href", item.reference);
}
document.addEventListener("DOMContentLoaded",function init() {
	console.log("launched");
	var hook={
		selector:".header-button",
		event:"click",
		listener:"toggleEventHandler"
	};
	togglePage("indexPage");
	registEvent(hook);
});