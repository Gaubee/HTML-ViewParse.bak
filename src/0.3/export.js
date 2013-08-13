
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
		shadowBody.innerHTML = htmlStr;
		var insertBefore = [];
		_traversal(shadowBody, function(node, index, parentNode) {
			if (node.nodeType === 3) {
				shadowDIV.innerHTML = parseRule(node.textContent);
				$.push(insertBefore, {
					baseNode: node,
					parentNode: parentNode,
					insertNodes: [].slice.call(shadowDIV.childNodes)
				});
			}
		});
		for (var i = 0, item; item = insertBefore[i]; i += 1) {
			var node = item.baseNode,
				parentNode = item.parentNode
				insertNodes = item.insertNodes;
			for (var j = 0, refNode; refNode = insertNodes[j]; j += 1) {
				parentNode.insertBefore(refNode, node);
			}
			parentNode.removeChild(node);
		}
		shadowBody.innerHTML = shadowBody.innerHTML;
		var result = ElementHandle(shadowBody);
		return View(result);
	},
	scans: function() {
		els = document.getElementsByTagName("script")
		for (var i = 0, el; el = els[i]; i += 1) {
			if (el.getAttribute("type") === "text/template") {
				V.modules[el.getAttribute("name")] = V.parse(el.innerText);
			}
		}
	},
	registerTrigger: function(handleName, triggerFactory) {
		try {
			V.triggers[handleName] = triggerFactory;
		} catch (e) {
			console.wran(e.message)
		}
	},
	registerHandle: function(handleName, handle) {
		if (V.handles[handleName]) {
			throw handleName + " handler already exists.";
		}
		V.handles[handleName] = handle
	},
	triggers: {},
	handles: {},
	modules: {}
};