!(function viewParse(global) {
	var V = global.View = {};

	V.registerHandle = function registerHandle(handleName, handleFun) {

	};
	var treeType = V.treeType = {
		"String": 0,
		"Handle": 1
	}

	var mergerSplit = function(beginChar, endChar, str, rule) {
		var parseArr;
		if (str.indexOf(beginChar) !== 0) {
			//find endChar and build a tree
			var bParseArr = str.split(beginChar);
			var deep = 0;
			var tree = [];
			tree[0] = {
				type: "string",
				value: String(bParseArr[0]),
				childTree: [],
				parentTree: null
			};
			for (var i = 1; i < bParseArr.length; i += 1) {
				var bParseArrStr = bParseArr[i];
				var eParseArr = bParseArrStr.split(endChar);
				tree[tree.length] = {
					type: "handle",
					value: trim(eParseArr[0]),
					childTree: [],
					parentTree: tree
				};
				tree = tree.childTree;
				if (eParseArr.length === 1) {

				} else {

				}
			}
		} else {
			parseArr = mergerSplit(beginChar, endChar, " " + str, rule);
			parseArr.shift();
		}
		return parseArr;
	};

	var buildTree = function(beginChar, endChar, str, parentNode) {
		if (str.indexOf(beginChar) !== -1) {
			return [{
				type: treeType["String"],
				value: str,
				parentNode: parentNode,
				childNode: []
			}]
		} else {

		}
	};
	var pickNode = function(beginChar, endChar, str) {
		var deep = 0;
		var beingIndex = str.indexOf(beginChar);
		if (beingIndex !== -1) {

		}
	}
	var wrapNode = V.wrapNode = function(beginChar, endChar, str) {
		var beingIndex = str.indexOf(beginChar);
		var endIndex = str.indexOf(endChar);
		if (beingIndex === endIndex === -1) {
			return null
		}
		if (beingIndex < endIndex && beingIndex !== -1) {
			var parse = wrapNode(beginChar, endChar, str.substring(beingIndex + 1));
			var childNodes = parse.nodes;
			var surplusStr = str.replace(parse.pickStr, "");
			do {
				if (parse = wrapNode(beginChar, endChar, surplusStr)) {
					childNodes.concat(parse.nodes);
					surplusStr = surplusStr.replace(parse.pickStr, "");
				}
			} while (parse);
		} else {
			var nodes = [{
				type: "node",
				value: str.substring(0, endIndex),
				childNodes: childNodes || []
			}];
			return {
				nodes: nodes,
				pickStr: str.substring(beingIndex, endIndex)
			}
		}
	};

	var getNearestNode = V.getNearestNode = function(beginChar, endChar, str) {
		var beingIndex = str.indexOf(beginChar);
		var endIndex = str.indexOf(endChar);
		if (beingIndex !== -1) {
			var cacheStr = str.substring(beingIndex+1);
			if (cacheStr.indexOf(beginChar)<=endIndex) {
				return getNearestNode(beginChar, endChar, cacheStr);
			}else{
				cacheStr = cacheStr.substring(0,endIndex-1);
				return {
					nodes: [{
						type: "node",
						value:cacheStr
					}],
					pickStr: beginChar+cacheStr+endChar,
					endIndex:endIndex
				}
			}
		} else {
			return {
				nodes: [{
					type: "string",
					value: str
				}],
				pickStr: str
			}
		}
		return [beingIndex,endIndex];
	};

	var getNodes = V.getNodes = function(beginChar,endChar,str){
		var nodes = [],
			cacheNode;
			cacheNode = getNearestNode(beginChar,endChar,str)
			nodes.concat(cacheNode);
			str = str.replace(cacheNode.pickStr,"");
			console.log(str);
			
			cacheNode = getNearestNode(beginChar,endChar,str)
			nodes.concat(cacheNode);
			str = str.replace(cacheNode.pickStr,"");
			console.log(str);

			cacheNode = getNearestNode(beginChar,endChar,str)
			nodes.concat(cacheNode);
			str = str.replace(cacheNode.pickStr,"");
			console.log(str);
			
			cacheNode = getNearestNode(beginChar,endChar,str)
			nodes.concat(cacheNode);
			str = str.replace(cacheNode.pickStr,"");
			console.log(str);

		return nodes;
	}
	V._parse = function _parse(str) {

	};
}(this));
// console.log(
// "I'm a {#if {{sex}}==='woman'}girl{#else}boy{/if}.".split("{"),
// "my name is {{fullName}}".split("{")
// );

// console.log(
// 	"I'm a {#if {#eque {{sex}}{{'woman'}} } }girl{#else}boy{/if{}}.".replace(/\{/g, "><").replace(/\}/g, "><")
// )

// console.log(
// this.View.getNodes("{", "}", "I'm a {#if{ {#eque{ {{ sex }}{{'woman'}} }} }}girl{#else{}}boy{/if{}}.")
// )


// console.log(
// "I'm a {#if{ {#eque{ {{ sex }}{{'woman'}} }} }}girl{#else{}}boy{/if{}}.".replace(/\{([\w\W]*?)[\{\}]/g,"<span handle='$1'>")
// 	)
console.log(
"I'm a {#if{ {#eque{ {{ sex }}{{'woman'}} }} }}girl{#else}boy{/if{}}.".replace(/\{([\w\W]*?)[\{\}]/g,"<span handle='$1'>").replace(/\}[\s]*\}/g,"</span>")
	)
// var strA = "I'm a {#if{ {#eque{ {{ sex }}{{'woman'}} }} }}girl{#else{}}boy{/if{}}.",
// 	strB = "";
// do{
// 	strB = strA;
// 	strA = strA.replace(/\{([\w\W]*?)\{|\}/,"<span handle='$1'>");
// 	console.log(strA,"\n");
// }while(strB!==strA);