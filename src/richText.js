
/* function markdownToAST(src){
	src.replace(/\n\s*\n/,"\x1f");
	let res=[];
	function Item() {
		this.type = "text";
		this.indentLevel = 0;
		this.content = "";
		this.alt = "";
		this.head = true;
	}
	let curItem=new Item();
	res.additem = function (item) {
		delete item.head;
		res.push(item);
	};
	for(let i=0;i<src.length;i++){
		switch(src[i]){
			case '#':
				curItem.type="title";
				curItem.indentLevel++;
			break;
			case '-':
			case '\x1f':
				res.addItem(curItem);
				curItem=new Item();
			break;
			case '[':
				res.addItem(curItem);
				curItem=new Item();
				curItem.type="link";
			break;
			case ' ':
			break;
			default:
				curItem.content += src[i];
				curItem.head= false;
		}
	}
} */
function STNode(type,text,level=0) {
	this.type = type;
	this.text=text;
	this.level=level;
	this.child = [];
}
STNode.clone = function (node) {
	var res = new STNode(node.type,node.text,node.level);
	res.child = node.child;
	return res;
};
STNode.prototype.concat = function (node,type) {
	var res = new STNode((type||this.type||node.type),this.text + node.text,this.level + node.level);
	res.child = this.child.concat(node.child);
	return res;
};
/**
 * 使用ASCII单元分隔符（0x1f）代替两个换行
 * @param {string} src 
 */
function markdownToAST(src){
	let literal=[];
	//区分各类字符
	for(let i=0;i<src.length;i++){
		if(punctuationChar(src[i]) ){
			literal.push(new STNode('punc',src[i],1));
		}else if(src[i]==0xa||src[i]==0xd){
			literal.push(new STNode('endchar',src[i]));
		}else if(src[i]==0x20){
			literal.push(new STNode('space',src[i],1));
		}else if(src[i]==0x9){
			literal.push(new STNode('space',src[i],4));
		}else{
			literal.push(new STNode('text',src[i]));
		}
	}
	//合并行尾、连续空格、连续井号
	let grouped = [];
	let lastNode = literal[0];
	let curNode = null;
	let outNode = STNode.clone(literal[0]) ;
	for(let i=1;i<literal.length;i++){
		curNode = literal[i];
		if(curNode.type==lastNode.type){
			if(curNode.type=='text'||(curNode.type=='space'&&curNode.text==lastNode.text)){
				outNode.concat(curNode);
			}else if(curNode.type=='endchar'){
				if(lastNode.text==0xa){
					grouped.push(outNode);
					outNode = STNode.clone(curNode) ;
				}
			}
		}else{
			grouped.push(outNode);
			outNode = STNode.clone(curNode) ;
		}
		lastNode=curNode;
	}
}
/**
 * 识别除空格、换行、制表以外的空白字符（ punctuation character ），详见https://github.github.com/gfm/#punctuation-character
 * @param {string} char
 * @returns {Boolean}  
 */
function whitespaceChar(char) {
	return (char==0xb||char>=0xc);
}
/**
 * 识别所有标点分隔符（ punctuation character ），详见https://github.github.com/gfm/#punctuation-character
 * @param {string} char
 * @returns {Boolean}  
 */
function punctuationChar(char) {
	return (char<=0x2f&&char>=0x21)||
		(char<=0x40&&char>=0x3a)||
		(char<=0x60&&char>=0x5b)||
		(char<=0x7e&&char>=0x7b);
}