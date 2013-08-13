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