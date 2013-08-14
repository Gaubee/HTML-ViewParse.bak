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
	slice: function(likeArr) {
		var array;
		try {
			array = Array.prototype.slice.call(likeArr, 0); //non-IE and IE9+
		} catch (ex) {
			array = [];
			for (var i = 0, len = likeArr.length; i < len; i++) {
				array.push(likeArr[i]);
			}
		}
		return array;
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
	reverseEach:function(arr,callback,i){
		if (!arr) return;
		return this._each($.slice(arr).reverse(), callback, arr.length-1-i)
	},
	forEach: function(arr, callback, i) {
		if (!arr) return;
		return this._each($.slice(arr), callback, i)
	},
	_each:function(arr,callback,i){
		for (i = i || 0; i < arr.length; i += 1) {
			if (callback(arr[i], i, arr) === false) break;
		}
	},
	create: function(proto) {
		_Object_create_noop.prototype = proto;
		return new _Object_create_noop;
	},
	DOM: {
		Comment: function(info) {
			return document.createComment(info)
		},
		insertBefore: function(parentNode, insertNode, beforNode) {
			// try{
			parentNode.insertBefore(insertNode, beforNode||null);
			// }catch(e){}
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
		replace: function(parentNode, new_node, old_node) {
			try {
				parentNode.replaceChild(new_node, old_node);
			} catch (e) {}
		},
		traversal: _traversal
	}
};
var _Object_create_noop = function proto() {};

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
	// return $.bind(_create, this);
	return function(data) {
		return _create.call(self, data);
	}
};

function _buildHandler(handleNodeTree) {
	var self = this,
		handles = self._handles
		handleNodeTree = handleNodeTree || self.handleNodeTree;
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
var _attrRegExp = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g;

function _buildTrigger(handleNodeTree) {
	var self = this,
		triggers = self._triggers;
	handleNodeTree = handleNodeTree || self.handleNodeTree;
	_traversal(handleNodeTree, function(handle, index, parentHandle) {
		// handle.parentNode = parentHandle;
		if (handle.type === "handle") {
			var triggerFactory = V.triggers[handle.handleName];
			if (triggerFactory) {
				var trigger = triggerFactory(handle, index, parentHandle);
				// cos
				if (trigger) {
					var key = trigger.key = trigger.key || "";
					// console.log
					trigger.handleId = trigger.handleId || handle.id;
					//unshift list and In order to achieve the trigger can be simulated bubble
					$.unshift((triggers[key] = triggers[key] || []), trigger); //Storage as key -> array
					$.push(handle._triggers, trigger); //Storage as array
				}
			}
		} else if (handle.type === "element") {
			var node = handle.node,
				nodeHTMLStr = node.outerHTML.replace(node.innerHTML, ""),
				attrs = nodeHTMLStr.match(_attrRegExp);

				console.log("element attrs:",attrs)
				$.forEach(attrs, function(attrStr) {
					console.log("attr item:",attrStr)
					var attrKey = $.trim(attrStr.split("=")[0]),
						attrValue = node.getAttribute(attrKey);
					console.log("attr ",attrKey," is template!(",attrValue,")");
					if (_matchRule.test(attrValue)) {
						var attrViewInstance = (V.attrModules[handle.id + attrKey] = V.parse(attrValue))(),
							_shadowDIV = $.DOM.clone(shadowDIV);
						// console.log(at = attrViewInstance)
						attrViewInstance.append(_shadowDIV);
						$.forIn(attrViewInstance._triggers, function(triggerCollection, key) {
							$.forEach(triggerCollection, function(trigger) {
								var _newTrigger = $.create(trigger);
								_newTrigger.event = function(NodeList, database, eventTrigger){
									$.forIn(attrViewInstance._triggers,function(attrTriggerCollection,attrTriggerKey){
										$.forEach(attrTriggerCollection,function(attrTrigger){
											attrTrigger.event(attrViewInstance.NodeList, database, eventTrigger);
										})
									});
									NodeList[handle.id].currentNode.setAttribute(attrKey, _shadowDIV.innerHTML)
								};
								// var _trigger = trigger.event,
									// _newTrigger = function(NodeList, database, eventTrigger) {
									// 	_trigger(attrViewInstance.NodeList, database, eventTrigger);
									// 	console.log(attrKey, _shadowDIV.innerHTML, NodeList[handle.id].currentNode)
									// 	NodeList[handle.id].currentNode.setAttribute(attrKey, _shadowDIV.innerHTML)
									// };
								// trigger.event = _newTrigger;
								$.unshift((triggers[key] = triggers[key] || []), _newTrigger); //Storage as key -> array
								$.push(handle._triggers, _newTrigger); //Storage as array
							})
						});
					}
				});
		}
	});
};

function _create(data) {
	var self = this,
		NodeList_of_ViewInstance = {}, //save newDOM  without the most top of parentNode -- change with append!!
		topNode = $.create(self.handleNodeTree);
	topNode.currentNode = $.DOM.clone(shadowBody);
	$.pushByID(NodeList_of_ViewInstance, topNode);

	_traversal(topNode, function(node, index, parentNode) {
		node = $.pushByID(NodeList_of_ViewInstance, $.create(node));
		if (!node.ignore) {
			var currentParentNode = NodeList_of_ViewInstance[parentNode.id].currentNode || topNode.currentNode;
			var currentNode = node.currentNode = $.DOM.clone(node.node);
			$.DOM.append(currentParentNode, currentNode);
			// if (node.type === "comment") {
			// 	console.log(node.id,node.currentNode,NodeList_of_ViewInstance[node.id]);
			// }
		}
	});


	// _traversal(self.handleNodeTree, function(node, index, parentNode) {
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
	$.forEach(self._handles, function(handle) {
		// handle(NodeList_of_ViewInstance);
		handle.call(self, NodeList_of_ViewInstance);
	});
	// console.log(self.handleNodeTree.newNode, DOMs);

	// console.log("ViewInstance", ViewInstance(self.handleNodeTree, NodeList_of_ViewInstance, self._triggers))
	return ViewInstance(self.handleNodeTree, NodeList_of_ViewInstance, self._triggers);
};
/*
 * View Instance constructor
 */

var ViewInstance = function(handleNodeTree, NodeList, triggers, database) {
	if (!(this instanceof ViewInstance)) {
		return new ViewInstance(handleNodeTree, NodeList, triggers, database);
	}
	var self = this;
	self.handleNodeTree = handleNodeTree;
	self.DOMArr = $.slice(handleNodeTree.childNodes);
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
	var self = this;
	$.forEach(tiggerCollection,function(trigger){
		// if (trigger.chain) {
		// 	console.log("key:",trigger.key,trigger,",chain!!")
		// 	var chainTriggers = self._triggers[trigger.key],
		// 		index = $.indexOf(chainTriggers,trigger);
		// 	for(var i = 0;i<index;i+=1){
				
		// 	}
		// }
		trigger.event(NodeList,database,eventTrigger);
		if (trigger.bubble) {
			var parentNode = NodeList[trigger.handleId].parentNode;
			parentNode&&_bubbleTrigger.apply(self,[parentNode._triggers,NodeList,database,trigger]);
		}
		// if (trigger.chain) {
		// 	$.forEach(chainTriggers,function(chain_trigger){
		// 		console.log("chain:",chain_trigger)
		// 		chain_trigger.event(NodeList,database,trigger);
		// 	},index+1);
		// 	console.log(index,chainTriggers);
		// };
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
	// _database: null,
	// _triggers: null,
	get: function get(key) {},
	set: function set(key, value) {
		var self = this,
			database = self._database,
			NodeList = self.NodeList,
			oldValue = database[key];
		if (oldValue != value) {
			self._database[key] = value;
		}
		_bubbleTrigger.apply(self,[self._triggers[key],NodeList,database])
	}
};
var _parse = function(node) {
	var result = [];
	for (var i = 0, child_node, childNodes = node.childNodes; child_node = childNodes[i]; i += 1) {
		switch (child_node.nodeType) {
			case 3:
				// console.log("child_node.data",child_node.data)
				if ($.trim(child_node.data)) {
					// console.log("node|(text):", child_node.data);
					$.push(result, TextHandle(child_node))
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
	this._controllers = [];
	this._controllers[true] = [];
	this._controllers[false] = [];
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
	this._controllers = [];
	this._controllers[true] = [];
	this._controllers[false] = [];
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
	this._controllers = [];
	this._controllers[true] = [];
	this._controllers[false] = [];
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
var _matchRule = /\{[\w\w]*?\{[\w\W]*?\}[\s]*\}/;
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
	modules: {},
	attrModules:{}
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
		// nextHandle = nextHandle && nextHandle.newNode;
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
		conditionDOM = handle._controllers,
		// = {
		// 	"true": [], //true is "if"
		// 	"false": [] //false is "else"
		// },
		conditionStatus = true, //"if";
		trigger,
		deep = 0;
	$.forEach(parentHandle.childNodes, function(child_handle, i, childHandles) {
		// if (child_handle.type !== "handle") {
		if (!ignoreHandleType.test(child_handle.type)) {
			// console.log(child_handle)
			$.push(child_handle._controllers, id);
			// $.push(child_handle._controllers[conditionStatus])
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
	// console.log(conditionDOM);
	trigger = {
		// key:"",//default is ""
		chain: true,
		event: function(NodeList_of_ViewInstance, database, triggerBy) {
			var conditionVal = NodeList_of_ViewInstance[conditionHandleId]._data,
				parentNode = NodeList_of_ViewInstance[parentHandleId].currentNode,
				markHandleId = comment_else_id, //if(true)
				markHandle; //default is undefined --> insertBefore === appendChild
			if (NodeList_of_ViewInstance[this.handleId]._data !== conditionVal || triggerBy) {
				NodeList_of_ViewInstance[this.handleId]._data = conditionVal;
				if (!conditionVal) {
					markHandleId = comment_endif_id;
				}
				if (markHandleId) {
					markHandle = NodeList_of_ViewInstance[markHandleId].currentNode;
				}
				$.forEach(conditionDOM[conditionVal], function(id) {
					var currentHandle = NodeList_of_ViewInstance[id],
						node = currentHandle.currentNode,
						placeholderNode = (NodeList_of_ViewInstance[id].placeholderNode = NodeList_of_ViewInstance[id].placeholderNode || $.DOM.Comment(id)),
						display = true;
					// console.log(node,currentHandle._controllers)
					$.forEach(currentHandle._controllers,function(controller_id){
						var controllerHandle = NodeList_of_ViewInstance[controller_id]
						//console.log(controllerHandle._data,controllerHandle._controllers,controllerHandle._controllers[controllerHandle._data])
						display = display&&($.indexOf(controllerHandle._controllers[controllerHandle._data?true:false],currentHandle.id)!==-1);
					});
					if (display) {
						$.DOM.replace(parentNode, node, placeholderNode)
					}
				});
				$.forEach(conditionDOM[!conditionVal], function(id) {
					var node = NodeList_of_ViewInstance[id].currentNode;
					var placeholderNode = (NodeList_of_ViewInstance[id].placeholderNode = NodeList_of_ViewInstance[id].placeholderNode || $.DOM.Comment(id));
					// console.log("removeChild", node, id, parentNode)
					// $.DOM.removeChild(node, parentNode);
					// console.log(parentNode, placeholderNode, node)
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
		key = textHandle.node.data,
		trigger;
	if (parentHandle.type !== "handle") { //as textHandle
		trigger = {
			key: key,
			event: function(NodeList_of_ViewInstance, database) { //call by ViewInstance's Node
				NodeList_of_ViewInstance[textHandleId].currentNode.data = database[key];
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
		} else { //String for databese by key
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
// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.

}(this));