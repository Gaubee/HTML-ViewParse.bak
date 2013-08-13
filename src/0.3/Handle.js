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