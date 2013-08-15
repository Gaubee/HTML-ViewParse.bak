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
var _isIE = !+"\v1";
var _event_by_fun = true;
//by RubyLouvre(司徒正美)
//setAttribute bug:http://www.iefans.net/ie-setattribute-bug/
var IEfix = {
	acceptcharset: "acceptCharset",
	accesskey: "accessKey",
	allowtransparency: "allowTransparency",
	bgcolor: "bgColor",
	cellpadding: "cellPadding",
	cellspacing: "cellSpacing",
	"class": "className",
	colspan: "colSpan",
	checked: "defaultChecked",
	selected: "defaultSelected",
	"for": "htmlFor",
	frameborder: "frameBorder",
	hspace: "hSpace",
	longdesc: "longDesc",
	maxlength: "maxLength",
	marginwidth: "marginWidth",
	marginheight: "marginHeight",
	noresize: "noResize",
	noshade: "noShade",
	readonly: "readOnly",
	rowspan: "rowSpan",
	tabindex: "tabIndex",
	valign: "vAlign",
	vspace: "vSpace"
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

			// console.log("element attrs:", attrs)
			$.forEach(attrs, function(attrStr) {
				// console.log("attr item:", attrStr)
				var attrInfo = attrStr.search("="),
					attrKey = $.trim(attrStr.substring(0,attrInfo)).toLowerCase(),
					attrValue = node.getAttribute(attrKey),
					attrKey = attrKey.indexOf(V.prefix)?attrKey:attrKey.replace(V.prefix,""),
					attrKey = (_isIE && IEfix[attrKey]) || attrKey
					// attrValue = $.trim(attrStr.substring(attrInfo+1)),
					// attrValue = $.isString(attrValue)?attrValue.substring(1,attrValue.length-1):attrValue;
				// console.log("attr ", attrKey, " is template!(", attrValue, ")");
				if (_matchRule.test(attrValue)) {
					var attrViewInstance = (V.attrModules[handle.id + attrKey] = V.parse(attrValue))(),
						_shadowDIV = $.DOM.clone(shadowDIV);
					// console.log(at = attrViewInstance)
					attrViewInstance.append(_shadowDIV);
					$.forIn(attrViewInstance._triggers, function(triggerCollection, key) {
						$.forEach(triggerCollection, function(trigger) {
							var _newTrigger = $.create(trigger);
							_newTrigger.event = function(NodeList, database, eventTrigger) {
								$.forIn(attrViewInstance._triggers, function(attrTriggerCollection, attrTriggerKey) {
									$.forEach(attrTriggerCollection, function(attrTrigger) {
										attrTrigger.event(attrViewInstance.NodeList, database, eventTrigger);
									})
								});
								var currentNode = NodeList[handle.id].currentNode,
									attrValue = _shadowDIV.innerHTML;

								// console.log("set attr:", attrKey, ":", attrValue)


								if (attrKey === "style" && _isIE) {
									currentNode.style.setAttribute('cssText', attrValue);
								}else if(attrKey.indexOf("on")===0&& _event_by_fun){
									// console.log("event:",attrValue)
									currentNode.setAttribute(attrKey, Function(attrValue));
									// currentNode[attrKey] = attrValue;
									// currentNode.setAttribute(attrKey, attrValue);
									if(typeof currentNode.getAttribute(attrKey)==="string"){
										_event_by_fun = false;
										currentNode.setAttribute(attrKey, attrValue);
									}
								}else{
									currentNode.setAttribute(attrKey, attrValue);
								}
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
	return ViewInstance(self.handleNodeTree, NodeList_of_ViewInstance, self._triggers,data);
};