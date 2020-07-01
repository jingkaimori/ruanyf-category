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
			console.log(txt);
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
