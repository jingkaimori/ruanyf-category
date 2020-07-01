//let requestHeader=new Request();
fetch("/src/header.html",{}).then(
	(res)=>{
		if(res.ok){
			return res.text();
		}else{
			return Promise.reject(new Error(res.status));
		}
	}
).then(
	(txt)=>{
		document.getElementsByTagName("header")[0].innerHTML=txt;
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