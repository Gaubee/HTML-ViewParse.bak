// !(function viewParse(global) {
var global = this;
var shadowBody = document.createElement("body");
var shadowDIV = document.createElement("div");
var $ = {
	__uid: 0,
	uidAvator: Math.random().toString(36).substring(2),
	uid: function() {
		return this.__uid = this.__uid + 1;
	},
	trim: function(str) {
		str = str.replace(/^\s\s*/, ''),
		ws = /\s/,
		i = str.length;
		while (ws.test(str.charAt(--i)));
		return str.slice(0, i + 1);
	},
	push: function(arr, item) {
		arr[arr.length] = item;
	},
	insert:function(arr,index,item){
		arr.splice(index,0,item);
	},
	insertBefore:function(arr,beforItem,item){
		for(var i =0;i<arr.length;i+=1){
			if (arr[i] === beforItem) {
				arr.splice(i,0,item);
				break;
			}
		}
		return i;
	},
	indexOf:function(arr,item){
		for(var i =0;i<arr.length;i+=1){
			if (arr[i]===item) {
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
	forEach: function(arr, callback) {
		for (var i = 0; i < arr.length; i += 1) {
			callback(arr[i], i, arr);
		}
	},
	DOM: {
		insertBefore: function(insertNode, beforNode, parentNode) {
			if (!parentNode) {
				parentNode = beforNode.parentNode;
			}
			parentNode.insertBefore(insertNode, beforNode);
		},
		append: function(parentNode, appendNode) {
			parentNode.appendChild(appendNode);
		},
		clone: function(node, deep) {
			return node.cloneNode(deep);
		},
		removeChild:function(node,parentNode){
			parentNode = parentNode||node.parentNode;
			if (parentNode) {
				parentNode.removeChild(node)
			}
		}
	}
};
/*
 * View constructor
 */

function View(arg) {
	if (!(this instanceof View)) {
		return new View(arg);
	}
	this.parseNode = arg;
	this._buildHandler();
	this._buildTrigger();
	_traversal(this.parseNode, function(node, index, parentNode) {
		View.u[node.__uid] = node;
	});
	tt = this;
	return $.bind(this.create, this);
};
View.u = [];
View.prototype = {
	create: function(data) {
		this.parseNode.newNode = $.DOM.clone(shadowBody);
		_traversal(this.parseNode, function(node, index, parentNode) {
			if (!node.ignore) {
				node.newNode = node.node.cloneNode(false);
			}
		});
		var DOMs = []; //save newDOM  without the most top of parentNode -- change with append!!
		_traversal(this.parseNode, function(node, index, parentNode) {
			if (!node.ignore && node.display) { //build DOM construction
				parentNode = node.parentNode;
				$.DOM.append(parentNode.newNode, node.newNode)
			}
			var item = {
				currentNode: node.newNode,
				triggers: [],
				viewParseNode: node
			};
			// console.log(node.type,node.__uid)
			$.push(DOMs, item);
			DOMs["hashid|" + node.__uid] = item;
		});
		$.forEach(this._handle, function(handle) {
			handle();
		});
		// console.log(this.parseNode.newNode, DOMs);
		return ViewInstance(this.parseNode.newNode, DOMs, this._triggers);
	},
	_handle: [],
	_triggers: {},
	_buildTrigger: function(parseNode) {
		parseNode = parseNode || this.parseNode;
		var triggers = this._triggers;
		_traversal(parseNode, function(item_node, index, parseNode) {
			item_node.parentNode = parseNode;
			if (item_node.type === "handle") {
				var handleFun = V.triggers[item_node.handleName];
				handleFun && handleFun(item_node, index, parseNode, triggers)
			}
		});
	},
	_buildHandler: function(parseNode) {
		parseNode = parseNode || this.parseNode;
		var handle = this._handle;
		_traversal(parseNode, function(item_node, index, parseNode) {
			// console.log(item_node, index, parseNode)
			item_node.parentNode = parseNode;
			if (item_node.type === "handle") {
				var handleFun = V.handles[item_node.handleName];
				handleFun && handleFun(item_node, index, parseNode, handle);
			}
			// console.log(item_node);
		});
	}
};
/*
 * View Instance constructor
 */

var ViewInstance = function(DOMTree, NodeList, triggers, database) {
	if (!(this instanceof ViewInstance)) {
		return new ViewInstance(DOMTree, NodeList, triggers, database);
	}
	var self = this;
	self.DOMTree = DOMTree;
	self.DOMArr = [].slice.call(DOMTree.childNodes);
	self.NodeList = NodeList;
	self._database = database || {};
	self._triggers = {};
	self.TEMP = {};
	$.forIn(triggers, function(tiggerFunArr, key) {
		var tigger = self._triggers[key] = self._triggers[key] || [];
		$.forEach(tiggerFunArr, function(tiggerFun) {
			var id = tiggerFun.id;
			var hashId = "hashid|" + id;
			// console.log(tiggerFun)
			var T = {
				id: id,
				event: $.bind(tiggerFun.event, self)
			}
			$.push(tigger, T);
			self._triggers[hashId] = self._triggers[hashId] || [];
			$.push(self._triggers[hashId], T);
		})
	});
	$.forEach(self._triggers["."], function(tiggerFun) { //const value
		tiggerFun.event();
	});
};
ViewInstance.prototype = {
	append: function(el) {
		$.forEach(this.DOMArr, function(node) {
			$.DOM.append(el, node);
		});
		this.DOMTree = el;
	},
	_database: null,
	_triggers: null,
	get: function get(key) {},
	set: function set(key, value) {
		var self = this;
		var oldValue = self._database[key];
		if (oldValue != value) {
			self._database[key] = value;
		}
		$.forEach(self._triggers[key], function(tiggerFun) {
			var result = tiggerFun.event(key, self._database, oldValue, value);
			while (self.bubble) {
				// console.log(self.NodeList["hashid|" + tiggerFun.id].)
				self.bubble = false;
				var tiggerFun_s = self._triggers["hashid|" + self.NodeList["hashid|" + tiggerFun.id].viewParseNode.parentNode.__uid];
				if (tiggerFun_s) {
					$.forEach(tiggerFun_s, function(tiggerFun_c) {
						result = tiggerFun_c.event(key, self._database, oldValue, value, result);
						tiggerFun = tiggerFun_c
					});
				}
			}
		});
		// self.bubble = false;
	}
};

/*
 * handle nodes to array tree
 */
var _traversal = function(node, callback) {
	for (var i = 0, child_node, childNodes = node.childNodes; child_node = childNodes[i]; i += 1) {
		callback(child_node, i, node);
		if (child_node.nodeType === 1) {
			_traversal(child_node, callback);
		}
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

function Handle(type) {
	if (!(this instanceof Handle)) {
		return new Handle(type);
	}
	if (type) {
		this.type = type;
	}
};
Handle.prototype = {
	ignore: false, //ignore DOM
	display: true, //show or hidden DOM
	parentNode: null,
	childNodes: [],
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
	this.__uid = $.uid();
};
TemplateHandle.prototype = Handle();
TemplateHandle.prototype.ignore = true;
TemplateHandle.prototype.display = false;
TemplateHandle.prototype.nodeType = 1;
/*
 * ElementHandle constructor
 */

function ElementHandle(node) {
	if (!(this instanceof ElementHandle)) {
		return new ElementHandle(node);
	}
	this.node = node;
	this.attributeHandle = null;
	this.childNodes = _parse(node);
	this.__uid = $.uid();
};
ElementHandle.prototype = Handle("element")
ElementHandle.prototype.nodeType = 1;
/*
 * TextHandle constructor
 */

function TextHandle(node) {
	if (!(this instanceof TextHandle)) {
		return new TextHandle(node);
	}
	this.node = node;
	this.__uid = $.uid();
};
TextHandle.prototype = Handle("text")
TextHandle.prototype.nodeType = 3;
/*
 * CommentHandle constructor
 */

function CommentHandle(node) {
	if (!(this instanceof CommentHandle)) {
		return new CommentHandle(node);
	}
	this.node = node;
	this.__uid = $.uid();
};
CommentHandle.prototype = Handle("comment")
CommentHandle.prototype.nodeType = 8;
CommentHandle.prototype.display = false;
/*
 * parse function
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
			return;
		}
		V.handles[handleName] = handle
	},
	triggers: {},
	handles: {},
	modules: {}
};
V.registerHandle("", function(handleInstance, index, parentHandleInstance, expores) {
	var textDOM = handleInstance.childNodes[0];
	if (parentHandleInstance.type !== "handle") {
		var i = 0;
		do {
			i += 1;
			var nextDOM = parentHandleInstance.childNodes[index + i];
		} while (nextDOM && nextDOM.ignore);
		if (textDOM) {
			// console.log("registerHandle:",textDOM)
			
			// textDOM.ignore = false;
			textDOM.display = false;

			$.push(expores, function() {
				// console.log(handleInstance, textDOM, parentHandleInstance, expores)
				// nextDOM = parentHandleInstance.childNodes[index + i];
				// console.log(textDOM.newNode, index, i, nextDOM, parentHandleInstance.newNode, nextDOM && !nextDOM.ignore);
				nextDOM = nextDOM && nextDOM.newNode;
				$.DOM.insertBefore(textDOM.newNode, nextDOM, parentHandleInstance.newNode);//Manually insert node
				$.insertBefore(parentHandleInstance.childNodes,handleInstance,textDOM);//Node position calibration//no "$.insert" Avoid sequence error
			})
		}
	} else {
		if (textDOM) {
			// console.log("ignore",textDOM)
			textDOM.ignore = true;
			textDOM.display = false;
		}
	}
	// console.log(textDOM,parentHandleInstance.type);
});
var iforelseHandle = function(handleInstance, index, parentHandleInstance, expores){
	var handleName = handleInstance.handleName;
	var comment = document.createComment(handleName);
	var commentHandleInstance = CommentHandle(comment)
	$.push(handleInstance.childNodes, commentHandleInstance);
	var i = 0;
	do {
		i += 1;
		var nextDOM = parentHandleInstance.childNodes[index + i];
	} while (nextDOM && nextDOM.ignore);
	$.push(expores, function() {
		// nextDOM = parentHandleInstance.childNodes[index + i];
		nextDOM = nextDOM && nextDOM.newNode;
		$.DOM.insertBefore(commentHandleInstance.newNode, nextDOM, parentHandleInstance.newNode);//Manually insert node
		$.insertBefore(parentHandleInstance.childNodes,handleInstance,commentHandleInstance);//Node position calibration//no "$.insert" Avoid sequence error
	})
}
V.registerHandle("#if", iforelseHandle);
V.registerHandle("#else", iforelseHandle);
V.registerHandle("/if", iforelseHandle);
V.registerTrigger("", function(handleInstance, index, parentHandleInstance, expores) {
	var textNode = handleInstance.childNodes[0];
	var key = textNode.node.textContent;
	if (parentHandleInstance.type !== "handle") {
		var textNodeId = textNode.__uid;
		if (key) {
			$.push((expores[key] = expores[key] || []), {
				id: handleInstance.__uid,
				event: function(key, database, oldValue, newValue, result) {
					var NodeList = this.NodeList;
					// console.log(key, NodeList, NodeList["hashid|" + textNodeId]);
					NodeList["hashid|" + textNodeId].currentNode.textContent = newValue;
					this.bubble = false;
				}
			});
		}
	} else {
		// console.log(parentHandleInstance)
		if ((key[0] === key[key.length - 1]) && "\'\"".indexOf(key[0]) !== -1) { //is string
			$.push((expores["."] = expores["."] || []), { //const
				id: handleInstance.__uid,
				event: function() {
					this.bubble = true;
					// console.log("sssssssssssss" + key)
					this.TEMP["hashid|" + handleInstance.__uid] = key.substring(1, key.length - 1);
					return key;
				}
			});
		} else { //is database key
			$.push((expores[key] = expores[key] || []), {
				id: handleInstance.__uid,
				event: function(key, database, oldValue, newValue, result) {
					this.bubble = true;
					// console.log("sssssssssssss" + newValue)
					this.TEMP["hashid|" + handleInstance.__uid] = newValue
					return newValue;
				}
			});
		}
	}
	// console.log(textDOM,parentHandleInstance.type);
});
V.registerTrigger("equa", function(handleInstance, index, parentHandleInstance, expores) {
	$.push((expores[""] = expores[""] || []), {
		id: handleInstance.__uid,
		event: function(key, database, oldValue, newValue, result) {
			// console.log("??????", handleInstance.childNodes)
			var i = 0;
			var child_node = handleInstance.childNodes[i];
			// console.log(child_node.__uid, this.TEMP["hashid|" + child_node.__uid])
			var val = this.TEMP["hashid|" + child_node.__uid];
			var result = true;
			while (i < handleInstance.childNodes.length - 1) {
				i += 1;
				child_node = handleInstance.childNodes[i];
				// console.log(child_node.__uid, this.TEMP["hashid|" + child_node.__uid])
				if (val != this.TEMP["hashid|" + child_node.__uid]) {
					result = false
				}
			}
			this.bubble = true;
			return result;
		}
	});
});
V.registerTrigger("#if", function(handleInstance, index, parentHandleInstance, expores) {
	$.push((expores[""] = expores[""] || []), {
		id: handleInstance.__uid,
		event: function(key, database, oldValue, newValue, result) {
			var id = "hashid|" + handleInstance.__uid
			var self = this;
			if (self.TEMP[id] === undefined || self.TEMP[id] != result) {
				var display = self.TEMP[id] = result = !! result;
				var DOM = {
					"true": [],
					"false": []
				};
				var endRex = /#else|\/if/;
				var insertNodeID = handleInstance.childNodes[handleInstance.childNodes.length - 1].__uid; //default is <!-- if -->  __uid
				var removeNodeID = "";
				for (var i = index+1, child_node, childNodes = parentHandleInstance.childNodes; child_node = childNodes[i]; i += 1) {
					// console.log("#if:",child_node);
					if (child_node.type !== "handle") {
						$.push(DOM[display], child_node.__uid);
					} else if (endRex.test(child_node.handleName)) {
						removeNodeID = child_node.childNodes[child_node.childNodes.length - 1].__uid;
						break;
					}
				}
				for (i=i+1; child_node = childNodes[i]; i += 1) {
					// console.log("#if:",child_node);
					if (child_node.type !== "handle") {
						$.push(DOM[!display], child_node.__uid);
					} else if (endRex.test(child_node.handleName)) {
						break;
					}
				}
				if (!display) { //swap!!
					insertNodeID = [removeNodeID,removeNodeID = insertNodeID][0];
				}
				var insertNode = self.NodeList["hashid|"+insertNodeID];
				insertNode = insertNode&&insertNode.currentNode
				var removeNode = self.NodeList["hashid|"+removeNodeID];
				removeNode = removeNode&&removeNode.currentNode

				console.log(insertNodeID, insertNode,removeNode);

				var parentNode = self.NodeList["hashid|" + parentHandleInstance.__uid]; //.currentNode;
				parentNode = parentNode ? parentNode.currentNode : self.DOMTree;

				$.forEach(DOM[true],function(__uid){
					var node = self.NodeList["hashid|"+__uid].currentNode;
					$.DOM.insertBefore(node,insertNode,parentNode)
				});
				if (DOM[true][0]!==undefined) {
					// setTimeout(function(){
					$.DOM.insertBefore(insertNode,self.NodeList["hashid|"+DOM[true][0]].currentNode,parentNode);
					// },600)
				}
				console.log(DOM)
				$.forEach(DOM[false],function(__uid){
					var node = self.NodeList["hashid|"+__uid].currentNode;
					$.DOM.removeChild(node,parentNode);
				})


				console.log("equa:", result)
			}
		}
	});
})
// }(this));