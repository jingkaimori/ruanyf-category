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
	let matchRes = hook.selector.match(/^(\.|#)?([0-9a-zA-Z-]+)/);
	console.debug(matchRes);
	if(matchRes[1]=="."){
		/* for(let i of document.getElementsByClassName("header-button")){
			i.addEventListener("click",clickHeader);
		} */
		for(let i of document.getElementsByClassName(matchRes[2])){
			i.addEventListener(hook.event,window[hook.listener]);
		} 
	}else if(matchRes[1]=="#"){
		document.getElementById(matchRes[2]).addEventListener(hook.event,window[hook.listener]);
	}else{
		for(let i of document.getElementsByTagName(matchRes[2])){
			i.addEventListener(hook.event,window[hook.listener]);
		} 
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
 * 
 * @param {string} src 
 */
async function loadResource(src){
	return fetch(src,{}).then(
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
var hook={
	selector:".header-button",
	event:"click",
	listener:"toggleEventHandler"
};

function queryItem(){
	let requestOption={
		method:"GET"
	};
	let requestURL="/load/"+document.getElementById("inputBox").value;
	console.log(requestURL);
	fetch(requestURL,requestOption).then(
		(res)=>{
			if(res.ok){
				return res.text();
			}else{
				return Promise.reject(new Error(res.status));
			}
		}
	).then(
		(txt)=>{
			let item=JSON.parse(txt);

			let title=document.createElement("h2");
			title.innerText=item.title;

			let bottom=document.createElement("div");
			bottom.classList.add("article-bottom");

			let ref=document.createElement("a");
			ref.innerText=item.reference;
			ref.setAttribute("href",item.reference);

			let article=document.createElement("article");
			article.innerHTML = marked(item.markdown);
			article.insertBefore(title,article.firstChild);
			article.appendChild(ref);

			//console.log(document.getElementsByTagName("main")[0].innerHTML);
			let mainArea=document.getElementsByTagName("main")[0];
			document.getElementsByTagName("main")[0].appendChild(article);
		}
	).catch(
		
		(err) => {
			switch(err.message){
				case "404":
	
					break;
				default:
	
			}
		}
	);
}
togglePage("indexPage");
registEvent(hook);