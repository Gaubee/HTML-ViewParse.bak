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