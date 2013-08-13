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