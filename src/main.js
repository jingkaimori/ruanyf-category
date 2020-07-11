var pageMap={
	"indexPage":{
		path:"/src/about.html",
		hook:[]
	},
	"viewPage":{
		path:"/src/view.html",
		hook:[
			{
				selector:"#submitButton",
				event:"click",
				listener:"queryItem"
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
	}
};
/**
 * @interface Hook
 * @property {string} selector
 * @property {string} event
 * @property {string} listener
 */

/**
 * 
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
 * 
 * @param {string} id 
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
	
					break;
				default:
	
			}
			return Promise.reject(err);
		}
	);
}


function queryItem(){
	let requestURL="/load/"+document.getElementById("inputBox").value;
	console.log(requestURL);
	loadResource(requestURL).then(
		(txt)=>{
			let item=JSON.parse(txt);
			let fragment=document.getElementById("articleTemplate").content.cloneNode(true);

			let title=fragment.getElementById("contentTitle");
			title.innerText=item.title;

			let footer = fragment.getElementById("contentBottom");
			footer.insertAdjacentHTML("beforebegin",marked(item.markdown));
			
			let ref=fragment.getElementById("resourceLink");
			ref.innerText=item.reference;
			ref.setAttribute("href",item.reference);

			//console.log(document.getElementsByTagName("main")[0].innerHTML);
			let mainArea=document.getElementsByTagName("main")[0];
			mainArea.appendChild(fragment);
		}
	);
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