!(function viewParse(global) {

var global = this;
var shadowBody = document.createElement("body");
var shadowDIV = document.createElement("div");

var $ = {
	id: 100,
	uidAvator: Math.random().toString(36).substring(2),
	uid: function() {
		return this.id = this.id + 1;
	},
	// trim: function(str) {
	// 	whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
	// 	for (var i = 0, len = str.length; i < len; i++) {
	// 		if (whitespace.indexOf(str.charAt(i)) === -1) {
	// 			str = str.substring(i);
	// 			break;
	// 		}
	// 	}
	// 	for (i = str.length - 1; i >= 0; i--) {
	// 		if (whitespace.indexOf(str.charAt(i)) === -1) {
	// 			str = str.substring(0, i + 1);
	// 			break;
	// 		}
	// 	}
	// 	return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
	// },
	trim: function(str) {
		str = str.replace(/^\s\s*/, '')
		var ws = /\s/,
			i = str.length;
		while (ws.test(str.charAt(--i)));
		return str.slice(0, i + 1);
	},
	push: function(arr, item) {
		arr[arr.length] = item;
		return item;
	},
	unshift: function(arr, item) {
		arr.splice(0, 0, item);
	},
	pushByID: function(arr, item) {
		arr[item.id] = item;
		return item;
	},
	lastItem: function(arr) {
		return arr[arr.length - 1];
	},
	insert: function(arr, index, item) {
		arr.splice(index, 0, item);
	},
	// insertBefore: function(arr, beforItem, item) {
	// 	for (var i = 0; i < arr.length; i += 1) {
	// 		if (arr[i] === beforItem) {
	// 			arr.splice(i, 0, item);
	// 			break;
	// 		}
	// 	}
	// 	return i;
	// },
	insertAfter: function(arr, afterItem, item) {
		for (var i = 0; i < arr.length; i += 1) {
			if (arr[i] === afterItem) {
				arr.splice(i + 1, 0, item);
				break;
			}
		}
		return i;
	},
	indexOf: function(arr, item) {
		for (var i = 0; i < arr.length; i += 1) {
			if (arr[i] === item) {
				return i;
			}
		}
		return -1;
	},
	bind: function(fun, oThis) {
		if (typeof fun !== "function") {
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 2),
			fToBind = fun,
			fn = {},
			fNOP = fun.constructor.name,
			fBound = fun.name;
		fn[fNOP] = function() {};
		fn[fBound] = function() {
			return fToBind.apply(this instanceof fn[fNOP] && oThis ? this : oThis,
				aArgs.concat(Array.prototype.slice.call(arguments)));
		};
		fn[fBound].toString = function toString() {
			return fun.toString()
		};
		fn[fNOP].prototype = fun.prototype;
		fn[fBound].prototype = new fn[fNOP]();

		return fn[fBound];
	},
	forIn: function(obj, callback) {
		for (var i in obj) {
			callback(obj[i], i, obj);
		}
	},
	forEach: function(arr, callback, i) {
		if (!arr) return;
		arr = [].slice.call(arr);
		for (i = i || 0; i < arr.length; i += 1) {
			if (callback(arr[i], i, arr) === false) break;
		}
	},
	create: function(proto) {
		var fn = function proto() {};
		fn.prototype = proto;
		return new fn;
	},
	DOM: {
		Comment:function(info){
			return document.createComment(info)
		},
		insertBefore: function(parentNode, insertNode, beforNode) {
			if (!parentNode) {
				parentNode = beforNode.parentNode;
			}
			parentNode.insertBefore(insertNode, beforNode);
		},
		append: function(parentNode, node) {
			parentNode.appendChild(node);
		},
		clone: function(node, deep) {
			return node.cloneNode(deep);
		},
		removeChild: function(node, parentNode) {
			parentNode = parentNode || node.parentNode;
			if (parentNode) {
				parentNode.removeChild(node)
			}
		},
		replace:function(parentNode,new_node,old_node){
			try{
			parentNode.replaceChild(new_node,old_node);
			}catch(e){}
		},
		traversal: _traversal
	}
};
var _traversal = function(node, callback) {
	for (var i = 0, child_node, childNodes = node.childNodes; child_node = childNodes[i]; i += 1) {
		var result = callback(child_node, i, node);
		if (child_node.nodeType === 1 && result !== false) {
			_traversal(child_node, callback);
		}
	}
};
/*
 * View constructor
 */

function View(arg) {
	var self = this;
	if (!(self instanceof View)) {
		return new View(arg);
	}
	self.handleNodeTree = arg;
	self._handles = [];
	self._triggers = {}; //bey key word

	
	_buildHandler.call(self);
	_buildTrigger.call(self);
	// _traversal(this.handleNodeTree, function(node, index, parentNode) {
	// 	View.u[node.id] = node;
	// });
	return $.bind(create, this);
};

function _buildHandler(handleNodeTree) {
	handleNodeTree = handleNodeTree || this.handleNodeTree;
	var handles = this._handles
	_traversal(handleNodeTree, function(item_node, index, handleNodeTree) {
		// console.log(item_node, index, handleNodeTree)
		item_node.parentNode = handleNodeTree;
		if (item_node.type === "handle") {
			var handleFactory = V.handles[item_node.handleName];
			if (handleFactory) {
				var handle = handleFactory(item_node, index, handleNodeTree)
				// handle&&$.push(handles, $.bind(handle,item_node));
				handle && $.push(handles, handle);
			}
		}
		// console.log(item_node);
	});
};

function _buildTrigger(handleNodeTree) {
	var self = this,
		triggers = self._triggers;
	handleNodeTree = handleNodeTree || self.handleNodeTree;
	_traversal(handleNodeTree, function(handle, index, parentHandle) {
		// handle.parentNode = parentHandle;
		if (handle.type === "handle") {
			var triggerFactory = V.triggers[handle.handleName];
			if (triggerFactory) {
				var tigger = triggerFactory(handle, index, parentHandle);
				// cos
				if (tigger) {
					var key = tigger.key = tigger.key || "";
					// console.log
					tigger.handleId = tigger.handleId || handle.id;
					//unshift list and In order to achieve the trigger can be simulated bubble
					$.unshift((triggers[key] = triggers[key] || []), tigger); //Storage as key -> array
					$.push(handle._triggers, tigger); //Storage as array
				}
			}
		} else if (handle.type === "element") {

		}
	});
};
function create(data) {
		var NodeList_of_ViewInstance = {}; //save newDOM  without the most top of parentNode -- change with append!!
		var topNode = ($.pushByID(NodeList_of_ViewInstance, $.create(this.handleNodeTree)).currentNode = $.DOM.clone(shadowBody));
		_traversal(this.handleNodeTree, function(node, index, parentNode) {
			node = $.pushByID(NodeList_of_ViewInstance, $.create(node));
			if (!node.ignore) {
				var currentParentNode = NodeList_of_ViewInstance[parentNode.id].currentNode || topNode;
				var currentNode = node.currentNode = $.DOM.clone(node.node);
				$.DOM.append(currentParentNode, currentNode);
				// if (node.type === "comment") {
				// 	console.log(node.id,node.currentNode,NodeList_of_ViewInstance[node.id]);
				// }
			}
		});


		// _traversal(this.handleNodeTree, function(node, index, parentNode) {
		// 	if (!node.ignore && node.display) { //build DOM construction
		// 		parentNode = node.parentNode;
		// 		$.DOM.append(parentNode.newNode, node.newNode)
		// 	}
		// 	var item = {
		// 		currentNode: node.newNode,
		// 		triggers: [],
		// 		viewParseNode: node
		// 	};
		// 	// console.log(node.type,node.id)
		// 	$.push(DOMs, item);
		// 	DOMs["hashid|" + node.id] = item;
		// });
		$.forEach(this._handles, function(handle) {
			// handle(NodeList_of_ViewInstance);
			handle.call(this, NodeList_of_ViewInstance);
		});
		// console.log(this.handleNodeTree.newNode, DOMs);
		return ViewInstance(this.handleNodeTree, NodeList_of_ViewInstance, this._triggers);
	}
/*
 * View Instance constructor
 */

var ViewInstance = function(handleNodeTree, NodeList, triggers, database) {
	if (!(this instanceof ViewInstance)) {
		return new ViewInstance(handleNodeTree, NodeList, triggers, database);
	}
	var self = this;
	self.handleNodeTree = handleNodeTree;
	self.DOMArr = [].slice.call(handleNodeTree.childNodes);
	self.NodeList = NodeList;
	self._database = database || {};
	self._triggers = {};
	self.TEMP = {};
	$.forIn(triggers,function(tiggerCollection,key){
		self._triggers[key] = tiggerCollection;
	});
	$.forEach(self._triggers["."], function(tiggerFun) { //const value
		tiggerFun.event(NodeList,database);
	});
};
function _bubbleTrigger(tiggerCollection,NodeList,database,eventTrigger){
	$.forEach(tiggerCollection,function(trigger){
		trigger.event(NodeList,database,eventTrigger);
		if (trigger.bubble) {
			var parentNode = NodeList[trigger.handleId].parentNode;
			parentNode&&_bubbleTrigger(parentNode._triggers,NodeList,database,trigger);
		}
	});
};
ViewInstance.prototype = {
	append: function(el) {
		var handleNodeTree = this.handleNodeTree,
			NodeList = this.NodeList;
		$.forEach(handleNodeTree.childNodes,function(node,index,parentNode){
			// console.log(node,parentNode);
			if (!node.ignore) {
				$.DOM.append(el,NodeList[node.id].currentNode);
			}
		});
		NodeList[handleNodeTree.id].currentNode = el;
	},
	_database: null,
	_triggers: null,
	get: function get(key) {},
	set: function set(key, value) {
		var self = this,
			database = self._database,
			NodeList = self.NodeList,
			oldValue = database[key];
		if (oldValue != value) {
			self._database[key] = value;
		}
		_bubbleTrigger(self._triggers[key],NodeList,database)
	}
};
var _parse = function(node) {
	var result = [];
	for (var i = 0, child_node, childNodes = node.childNodes; child_node = childNodes[i]; i += 1) {
		switch (child_node.nodeType) {
			case 3:
				if ($.trim(child_node.textContent)) {
					// console.log("node|(text):", child_node.textContent);
					result[result.length] = TextHandle(child_node);
				}
				break;
			case 1:
				if (child_node.tagName.toLowerCase() === "span" && child_node.getAttribute("type") === "handle") {
					var handleName = child_node.getAttribute("handle");
					if (handleName !== null) {
						// console.log("node|(handle):", handleName);
						$.push(result, TemplateHandle(handleName, child_node))
					}
				} else {
					// console.log("node|(element):", child_node);
					$.push(result, ElementHandle(child_node))
				}
				break;
		}
	}
	return result;
};



/*
 * Handle constructor
 */

function Handle(type, opction) {
	var self = this;
	if (!(self instanceof Handle)) {
		return new Handle(type,opction);
	}
	if (type) {
		self.type = type;
	}
	$.forIn(opction, function(val,key) {
		self[key] = val;
	});
};
Handle.prototype = {
	ignore: false, //ignore DOM
	display: true, //show or hidden DOM
	parentNode: null,
	childNodes: [], //rewrite
	triggers: [], //rewrite
	newNode: null,
	type: "handle"
};

/*
 * TemplateHandle constructor
 */

function TemplateHandle(handleName, node) {
	if (!(this instanceof TemplateHandle)) {
		return new TemplateHandle(handleName, node);
	}
	this.handleName = $.trim(handleName);
	this.childNodes = _parse(node);
	this.id = $.uid();
	this._triggers = [];
};
TemplateHandle.prototype = Handle("handle", {
	ignore: true,
	display: false,
	nodeType: 1
});

/*
 * ElementHandle constructor
 */

function ElementHandle(node) {
	if (!(this instanceof ElementHandle)) {
		return new ElementHandle(node);
	}
	this.node = node;
	// this.attributeHandle = null;
	this.childNodes = _parse(node);
	this.id = $.uid();
	this._triggers = [];
};
ElementHandle.prototype = Handle("element", {
	nodeType: 1
})
/*
 * TextHandle constructor
 */

function TextHandle(node) {
	if (!(this instanceof TextHandle)) {
		return new TextHandle(node);
	}
	this.node = node;
	this.id = $.uid();
	// this._triggers = [];
};
TextHandle.prototype = Handle("text", {
	nodeType: 3
})
/*
 * CommentHandle constructor
 */

function CommentHandle(node) {
	if (!(this instanceof CommentHandle)) {
		return new CommentHandle(node);
	}
	this.node = node;
	this.id = $.uid();
};
CommentHandle.prototype = Handle("comment", {
	nodeType: 8,
	display: false
})
/*
 * parse function
 */

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
V.registerHandle("", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0];
	if (parentHandle.type !== "handle") {
		var i = 0;
		do {
			i += 1;
			var nextHandle = parentHandle.childNodes[index + i];
		} while (nextHandle && nextHandle.ignore);
		if (textHandle) { //textHandle as Placeholder

			textHandle.display = false;

			$.insertAfter(parentHandle.childNodes, handle, textHandle); //Node position calibration//no "$.insert" Avoid sequence error
			return function(NodeList_of_ViewInstance) {
				// console.log(this)
				var nextNodeInstance = nextHandle && NodeList_of_ViewInstance[nextHandle.id].currentNode,
					textNodeInstance = NodeList_of_ViewInstance[textHandle.id].currentNode,
					parentNodeInstance = NodeList_of_ViewInstance[parentHandle.id].currentNode
					$.DOM.insertBefore(parentNodeInstance, textNodeInstance, nextNodeInstance); //Manually insert node
			}
		}
	} else {
		if (textHandle) {
			// console.log("ignore",textHandle)
			textHandle.ignore = true;
			textHandle.display = false;
		}
	}
	// console.log(textHandle,parentHandle.type);
});
var iforelseHandle = function(handle, index, parentHandle) {
	var handleName = handle.handleName;
	var commentNode = $.DOM.Comment(handleName);
	var commentHandle = CommentHandle(commentNode) // commentHandle as Placeholder
	$.push(handle.childNodes, commentHandle);
	var i = 0;
	do {
		i += 1;
		var nextHandle = parentHandle.childNodes[index + i];
	} while (nextHandle && nextHandle.ignore);
	
	$.insertAfter(parentHandle.childNodes, handle, commentHandle); //Node position calibration//no "$.insert" Avoid sequence error
	return function(NodeList_of_ViewInstance) {
		// nextHandle = parentHandle.childNodes[index + i];
		nextHandle = nextHandle && nextHandle.newNode;
		// console.log(this)
		var nextNodeInstance = nextHandle && NodeList_of_ViewInstance[nextHandle.id].currentNode,
			commentNodeInstance = NodeList_of_ViewInstance[commentHandle.id].currentNode,
			parentNodeInstance = NodeList_of_ViewInstance[parentHandle.id].currentNode
			$.DOM.insertBefore(parentNodeInstance, commentNodeInstance, nextNodeInstance); //Manually insert node
	}
}
V.registerHandle("#if", iforelseHandle);
V.registerHandle("#else", iforelseHandle);
V.registerHandle("/if", iforelseHandle);
V.registerTrigger("#if", function(handle, index, parentHandle) {
	// console.log(handle)
	var id = handle.id,
		ignoreHandleType = /handle|comment/,
		conditionHandleId = handle.childNodes[0].id,
		parentHandleId = parentHandle.id,
		// comment_if_id = $.lastItem(handle.childNodes).id,
		comment_else_id,
		comment_endif_id,
		conditionDOM = {
			"true": [], //true is "if"
			"false": [] //false is "else"
		},
		conditionStatus = true, //"if";
		trigger,
		deep = 0;
	$.forEach(parentHandle.childNodes, function(child_handle, i, childHandles) {
		// if (child_handle.type !== "handle") {
		if (!ignoreHandleType.test(child_handle.type)) {
			// console.log(child_handle)
			$.push(conditionDOM[conditionStatus], child_handle.id);
		} else if (child_handle.handleName === "#if") {
			deep += 1
		} else if (child_handle.handleName === "#else") {
			if (deep === 1) {
				conditionStatus = !conditionStatus;
				comment_else_id = $.lastItem(child_handle.childNodes).id;
			}
		} else if (child_handle.handleName === "/if") {
			deep -= 1
			if (!deep) {
				comment_endif_id = $.lastItem(child_handle.childNodes).id;
				return false;
			}
		}
	}, index); // no (index + 1):scan itself:deep === 0 --> conditionStatus = !conditionStatus;
	console.log(conditionDOM);
	trigger = {
		// key:"",//default is ""
		event: function(NodeList_of_ViewInstance) {
			var conditionVal = NodeList_of_ViewInstance[conditionHandleId]._data,
				parentNode = NodeList_of_ViewInstance[parentHandleId].currentNode,
				markHandleId = comment_else_id, //if(true)
				markHandle; //default is undefined --> insertBefore === appendChild
			if (NodeList_of_ViewInstance[this.handleId]._data !== conditionVal) {
				NodeList_of_ViewInstance[this.handleId]._data = conditionVal;
				if (!conditionVal) {
					markHandleId = comment_endif_id;
				}
				if (markHandleId) {
					markHandle = NodeList_of_ViewInstance[markHandleId].currentNode;
				}
				$.forEach(conditionDOM[conditionVal], function(id) {
					var node = NodeList_of_ViewInstance[id].currentNode;
					var placeholderNode = (NodeList_of_ViewInstance[id].placeholderNode = NodeList_of_ViewInstance[id].placeholderNode||$.DOM.Comment(id));
					// console.log("insertBefore", node, markHandle, id, markHandleId, parentNode);
					// $.DOM.insertBefore(parentNode, node, markHandle)
					console.log(parentNode, node, placeholderNode)
					$.DOM.replace(parentNode, node, placeholderNode)
				});
				$.forEach(conditionDOM[!conditionVal], function(id) {
					var node = NodeList_of_ViewInstance[id].currentNode;
					var placeholderNode = (NodeList_of_ViewInstance[id].placeholderNode = NodeList_of_ViewInstance[id].placeholderNode||$.DOM.Comment(id));
					// console.log("removeChild", node, id, parentNode)
					// $.DOM.removeChild(node, parentNode);
					console.log(parentNode, placeholderNode, node)
					$.DOM.replace(parentNode, placeholderNode, node)
				})
			}
		}
	}
	// var result = {
	// 	// key:"",//default is ""
	// 	handle: handle,
	// 	event: function(NodeList_of_ViewInstance) {
	// 		$.forEach(parentHandle.childNodes, function(child_handle, i, childHandles) {
	// 			if (child_handle.id !== id) {

	// 			}
	// 		});
	// 	}
	// }
	return trigger;
});
V.registerTrigger("", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.textContent,
		trigger;
	if (parentHandle.type !== "handle") { //as textHandle
		trigger = {
			key: key,
			event: function(NodeList_of_ViewInstance, database) { //call by ViewInstance's Node
				NodeList_of_ViewInstance[textHandleId].currentNode.textContent = database[key];
			}
		}
	} else { //as stringHandle
		if ((key[0] === key[key.length - 1]) && "\'\"".indexOf(key[0]) !== -1) { // single String
			trigger = { //const 
				key: ".", //const trigger
				bubble: true,
				event: function(NodeList_of_ViewInstance, database) {
					NodeList_of_ViewInstance[this.handleId]._data = key.substring(1, key.length - 1);
				}
			};
		} else {  //String for databese by key
			trigger = {
				key: key,
				bubble: true,
				event: function(NodeList_of_ViewInstance, database) {
					NodeList_of_ViewInstance[this.handleId]._data = database[key];
					// console.log("sex!!!", NodeList_of_ViewInstance[this.handleId])
				}
			};
		}
	}
	return trigger;
});
V.registerTrigger("equa", function(handle, index, parentHandle) {
	var childHandlesId = [],
		trigger;
	$.forEach(handle.childNodes, function(child_handle) {
		if (child_handle.type === "handle") {
			$.push(childHandlesId, child_handle.id);
		}
	});
	trigger = {
		// key:"",//default key === ""
		bubble: true,
		event: function(NodeList_of_ViewInstance, database) {
			var equal,
				val = NodeList_of_ViewInstance[childHandlesId[0]]._data; //first value
			$.forEach(childHandlesId, function(child_handle_id) { //Compared to other values
				equal = (NodeList_of_ViewInstance[child_handle_id]._data == val);
				if (equal) {
					return false; //stop forEach
				}
			}, 1); //start from 1;
			// console.log(equal)
			NodeList_of_ViewInstance[this.handleId]._data = equal;
		}
	}
	return trigger;
});

}(this));