document.getElementById("submitButton").addEventListener("click",queryItem);

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
