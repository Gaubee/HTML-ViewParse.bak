
/*
 * parse rule
 */
 
function parseRule(str) {
	var parseStr = str
		.replace(/\{([\w\W]*?)[\{\}]/g, "<span type='handle' handle='$1'>")
		.replace(/\}[\s]*\}/g, "</span>");
	return parseStr;
};
/*
 * expores function
 */

var V = global.ViewParser = {
	parse: function(htmlStr) {
		var _shadowBody = $.DOM.clone(shadowBody);
		_shadowBody.innerHTML = htmlStr;
		// console.log("htmlStr:",htmlStr)
		var insertBefore = [];
		_traversal(_shadowBody, function(node, index, parentNode) {
			if (node.nodeType === 3) {
				$.push(insertBefore, {
					baseNode: node,
					parentNode: parentNode,
					insertNodesHTML: parseRule(node.data)
				});
			}
		});
		$.forEach(insertBefore,function(item){
			var node = item.baseNode,
				parentNode = item.parentNode
				insertNodesHTML = item.insertNodesHTML;
				shadowDIV.innerHTML = parseRule(insertNodesHTML);
			//Using innerHTML rendering is complete immediate operation DOM, 
			//innerHTML otherwise covered again, the node if it is not, 
			//then memory leaks, IE can not get to the full node.
			$.forEach(shadowDIV.childNodes,function(refNode){
				$.DOM.insertBefore(parentNode,refNode, node)
			})
			parentNode.removeChild(node);
		});
		_shadowBody.innerHTML = _shadowBody.innerHTML;
		// console.log("_shadowBody.innerHTML:",_shadowBody.innerHTML)
		var result = ElementHandle(_shadowBody);
		return View(result);
	},
	scans: function() {
		els = 
		$.forEach(document.getElementsByTagName("script"),function(scriptNode){
			if (scriptNode.getAttribute("type") === "text/template") {
				V.modules[scriptNode.getAttribute("name")] = V.parse(scriptNode.innerHTML);
			}
		});
	},
	registerTrigger: function(handleName, triggerFactory) {
		// try {
			V.triggers[handleName] = triggerFactory;
		// } catch (e) {
		// 	console.wran(e.message)
		// }
	},
	registerHandle: function(handleName, handle) {
		// if (V.handles[handleName]) {
		// 	throw handleName + " handler already exists.";
		// }
		V.handles[handleName] = handle
	},
	triggers: {},
	handles: {},
	modules: {}
};