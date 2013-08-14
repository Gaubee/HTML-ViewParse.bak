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
var _commentPlaceholder = function(handle,parentHandle){
	var handleName = handle.handleName,
		commentNode = $.DOM.Comment(handleName+handle.id),
		commentHandle = CommentHandle(commentNode) // commentHandle as Placeholder
	$.push(handle.childNodes, commentHandle);
	$.insertAfter(parentHandle.childNodes, handle, commentHandle); //Node position calibration//no "$.insert" Avoid sequence error
	return commentHandle;
};
var placeholderHandle = function(handle, index, parentHandle) {
	// var i = 0;
	// do {
	// 	i += 1;
	// 	var nextHandle = parentHandle.childNodes[index + i];
	// } while (nextHandle && nextHandle.ignore);

	var commentHandle = _commentPlaceholder(handle,parentHandle);//before return

	// return function(NodeList_of_ViewInstance) {
	// 	var nextNodeInstance = nextHandle && NodeList_of_ViewInstance[nextHandle.id].currentNode,
	// 		commentNodeInstance = NodeList_of_ViewInstance[commentHandle.id].currentNode,
	// 		parentNodeInstance = NodeList_of_ViewInstance[parentHandle.id].currentNode
	// 		$.DOM.insertBefore(parentNodeInstance, commentNodeInstance, nextNodeInstance); //Manually insert node
	// }
};
V.registerHandle("#if", placeholderHandle);
V.registerHandle("#else", placeholderHandle);
V.registerHandle("/if", placeholderHandle);
var _each_display = function(show_or_hidden,NodeList_of_ViewInstance){
	// console.log(show_or_hidden,"each");
	var handle = this,
		parentHandle = handle.parentNode,
		comment_endeach_id,
		arrViewInstances = handle.arrViewInstances;
	$.forEach(parentHandle.childNodes,function(child_handle,index,cs){//get comment_endeach_id
		if(child_handle.id === handle.id){
			comment_endeach_id = cs[index+ 3].id;
			return false;
		}
	});
	if (show_or_hidden) {
		$.forEach(arrViewInstances,function(viewInstance){
			// console.log(comment_endeach_id,NodeList_of_ViewInstance[comment_endeach_id],handle,parentHandle)
			viewInstance.insert(NodeList_of_ViewInstance[comment_endeach_id].currentNode)	
		})
	}else{
		$.forEach(arrViewInstances,function(viewInstance){
			// console.log(viewInstance)
			viewInstance.remove();
		})
	}
};
V.registerHandle("#each",function(handle, index, parentHandle){
	
	var _shadowBody = $.DOM.clone(shadowBody),
		eachModuleHandle = ElementHandle(_shadowBody),
		endIndex = 0;

	handle.arrViewInstances = [];
	handle.len = 0;
		// console.log()
	$.forEach(parentHandle.childNodes,function(childHandle,index){
		endIndex = index;
		if (childHandle.handleName === "/each") {
			return false
		}
		$.push(eachModuleHandle.childNodes,childHandle);
	},index+1);
// console.log(index+1,endIndex-index-1,parentHandle.childNodes)
	parentHandle.childNodes.splice(index+1,endIndex-index-1);
// console.log(parentHandle.childNodes)
	V.eachModules[handle.id] = View(eachModuleHandle);

	handle.display = _each_display;
	_commentPlaceholder(handle,parentHandle);//before return
});
V.registerHandle("/each",placeholderHandle);