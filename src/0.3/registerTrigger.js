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
	// console.log(parentHandle, index)
	$.forEach(parentHandle.childNodes, function(child_handle, i, childHandles) {
		// if (child_handle.type !== "handle") {
		/*if (!ignoreHandleType.test(child_handle.type)) {
			// console.log(child_handle)
			$.push(child_handle._controllers, id);
			// $.push(child_handle._controllers[conditionStatus])
			$.push(conditionDOM[conditionStatus], child_handle.id);
		} else */
		if (child_handle.handleName === "#if") {
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
		} else if (child_handle.type !== "comment") {
			// console.log(child_handle)
			$.push(child_handle._controllers, id);
			// $.push(child_handle._controllers[conditionStatus])
			$.push(conditionDOM[conditionStatus], child_handle.id);
		}
	}, index); // no (index + 1):scan itself:deep === 0 --> conditionStatus = !conditionStatus;
	// console.log(conditionDOM);
	trigger = {
		// key:"",//default is ""
		// chain: true,
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
					$.forEach(currentHandle._controllers, function(controller_id) {
						var controllerHandle = NodeList_of_ViewInstance[controller_id]
						//console.log(controllerHandle._data,controllerHandle._controllers,controllerHandle._controllers[controllerHandle._data])
						// console.log(currentHandle.id)
						display = display && ($.indexOf(controllerHandle._controllers[controllerHandle._data ? true : false], currentHandle.id) !== -1);
					});
					if (display) {
						if (currentHandle.display) { //Custom Display Function,default is false
							currentHandle.display(true,NodeList_of_ViewInstance, database, triggerBy)
						} else {
							// console.log("show", currentHandle)
							$.DOM.replace(parentNode, node, placeholderNode)
						}
					}
				});
				$.forEach(conditionDOM[!conditionVal], function(id) {
					var currentHandle = NodeList_of_ViewInstance[id],
						node = currentHandle.currentNode,
						placeholderNode = (currentHandle.placeholderNode = currentHandle.placeholderNode || $.DOM.Comment(id));
					// console.log("removeChild", node, id, parentNode)
					// $.DOM.removeChild(node, parentNode);
					// console.log(parentNode, placeholderNode, node)
					if (currentHandle.display) { //Custom Display Function,default is false
						currentHandle.display(false,NodeList_of_ViewInstance, database, triggerBy)
					} else {
						$.DOM.replace(parentNode, placeholderNode, node)
					}
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
V.registerTrigger("#each", function(handle, index, parentHandle) {
	var id = handle.id,
		arrDataHandleKey = handle.childNodes[0].childNodes[0].node.data,
		comment_endeach_id = parentHandle.childNodes[index + 3].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		arrViewInstances = handle.arrViewInstances,
		trigger;
	// console.log(handle)
	trigger = {
		event: function(NodeList_of_ViewInstance, database) {
			var data = database[arrDataHandleKey];
			var divideIndex = 0;
			var inserNew;
			if (true) {};
			$.forEach(data, function(eachItemData, index) {
				// console.log(arrViewInstances[index])
				if (!arrViewInstances[index]) {
					arrViewInstances[index] = V.eachModules[id]();
					inserNew = true;
				}
				var viewInstance = arrViewInstances[index];
				if (viewInstance._packingBag) {//be remove into packingBag
					inserNew = true;
				}
				$.forIn(eachItemData, function(dataVal, dataKey) {
					viewInstance.set(dataKey, dataVal);
				});
				if (inserNew) {
					viewInstance.insert(NodeList_of_ViewInstance[comment_endeach_id].currentNode)
					// console.log(NodeList_of_ViewInstance[id]._controllers)
				}
				divideIndex = index;
			});
			// console.log(divideIndex)
			divideIndex+=1;
			$.forEach(arrViewInstances, function(eachItemHandle) {
				eachItemHandle.remove();
			}, divideIndex);
			var lengthKey = arrDataHandleKey + ".length";
			// console.log(lengthKey);
			if (database.get(lengthKey) !== divideIndex) {
				database.set(lengthKey, divideIndex)
				handle.len = divideIndex
			}
		}
	}
	return trigger
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
		if ($.isString(key)) { // single String
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