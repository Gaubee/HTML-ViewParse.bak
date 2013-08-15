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
	self._database.set = function() {
		self.set.apply(self, $.slice(arguments))
	};
	self._database.get = function() {
		self.get.apply(self, $.slice(arguments))
	};
	self._packingBag;
	self._triggers = {};
	self.TEMP = {};
	$.forIn(triggers, function(tiggerCollection, key) {
		self._triggers[key] = tiggerCollection;
	});
	$.forEach(self._triggers["."], function(tiggerFun) { //const value
		tiggerFun.event(NodeList, database);
	});
	self.reDraw()
};

function _bubbleTrigger(tiggerCollection, NodeList, database, eventTrigger) {
	var self = this;
	$.forEach(tiggerCollection, function(trigger) {
		// if (trigger.chain) {
		// 	console.log("key:",trigger.key,trigger,",chain!!")
		// 	var chainTriggers = self._triggers[trigger.key],
		// 		index = $.indexOf(chainTriggers,trigger);
		// 	for(var i = 0;i<index;i+=1){

		// 	}
		// }
		trigger.event(NodeList, database, eventTrigger);
		if (trigger.bubble) {
			var parentNode = NodeList[trigger.handleId].parentNode;
			parentNode && _bubbleTrigger.apply(self, [parentNode._triggers, NodeList, database, trigger]);
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

function _replaceTopHandleCurrent(self, el) {
	var handleNodeTree = self.handleNodeTree,
		NodeList = self.NodeList;
	self._packingBag = self._packingBag || NodeList[handleNodeTree.id].currentNode
	NodeList[handleNodeTree.id].currentNode = el;
	// self.reDraw();
};
ViewInstance.prototype = {
	reDraw: function() {
		var self = this,
			database = self._database;
		// console.log(database)
		$.forIn(database, function(val, key) {
			if (!/get|set/.test(key)) {
				self.set(key, val);
			}
		});
	},
	append: function(el) {
		var self = this,
			handleNodeTree = self.handleNodeTree,
			NodeList = self.NodeList,
			currentTopNode = NodeList[handleNodeTree.id].currentNode;

		$.forEach(currentTopNode.childNodes, function(child_node) {
			$.DOM.append(el, child_node);
		});
		_replaceTopHandleCurrent(self, el)
	},
	insert: function(el) {
		var self = this,
			handleNodeTree = self.handleNodeTree,
			NodeList = self.NodeList,
			currentTopNode = NodeList[handleNodeTree.id].currentNode,
			elParentNode = el.parentNode;

		$.forEach(currentTopNode.childNodes, function(child_node) {
			$.DOM.insertBefore(elParentNode, child_node, el);
		});
		_replaceTopHandleCurrent(self, elParentNode)
	},
	remove: function() {
		// console.log(this._packingBag)
		if (this._packingBag) {
			this.append(this._packingBag)
			this._packingBag = undefined; //when be undefined,can't no be remove again. --> it should be insert
		}
	},
	// _database: null,
	// _triggers: null,
	get: function get(key) {
		var self = this,
			database = self._database
		return database[key]
	},
	set: function set(key, value) {
		var self = this,
			database = self._database,
			NodeList = self.NodeList,
			oldValue = database[key];
		if (oldValue != value) {
			self._database[key] = value;
		}

		_bubbleTrigger.apply(self, [self._triggers[key], NodeList, database])
	}
};