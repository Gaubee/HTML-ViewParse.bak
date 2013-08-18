function View(a){var b=this;return b instanceof View?(b.handleNodeTree=a,b._handles=[],b._triggers={},_buildHandler.call(b),_buildTrigger.call(b),function(a){return _create.call(b,a)}):new View(a)}function _buildHandler(a){var b=this,c=b._handles;a=a||b.handleNodeTree,_traversal(a,function(a,b,d){if(a.parentNode=d,"handle"===a.type){var e=V.handles[a.handleName];if(e){var f=e(a,b,d);f&&$.push(c,f)}}})}function _buildTrigger(a){var b=this,c=b._triggers;a=a||b.handleNodeTree,_traversal(a,function(a,b,d){if("handle"===a.type){var e=V.triggers[a.handleName];if(e){var f=e(a,b,d);if(f){var g=f.key=f.key||"";f.handleId=f.handleId||a.id,$.unshift(c[g]=c[g]||[],f),$.push(a._triggers,f)}}}else if("element"===a.type){var h=a.node,i=h.outerHTML.replace(h.innerHTML,""),j=i.match(_attrRegExp);$.forEach(j,function(b){var d=b.search("="),e=$.trim(b.substring(0,d)),f=h.getAttribute(e);if(e=e.toLowerCase(),e=e.indexOf(V.prefix)?e:e.replace(V.prefix,""),e=_isIE&&IEfix[e]||e,_matchRule.test(f)){var g=(V.attrModules[a.id+e]=V.parse(f))(),i=$.DOM.clone(shadowDIV);g.append(i),$.forIn(g._triggers,function(b,d){d&&"."!==d&&$.forEach(b,function(b){var f=$.create(b);f.bubble=!1,f.event=function(b,c){$.forIn(g._triggers,function(a,b){g.set(b,c[b])});var d=b[a.id].currentNode,f=i.innerText;if(void 0===f&&(f=i.innerHTML.replace(_comment_reg,"")),"style"===e&&_isIE)d.style.setAttribute("cssText",f);else if(0===e.indexOf("on")&&_event_by_fun){try{var h=Function(f)}catch(j){h=$.noop}d.setAttribute(e,h),"string"==typeof d.getAttribute(e)&&(_event_by_fun=!1,d.setAttribute(e,f))}else d.setAttribute(e,f);"value"===e&&(d.value=f)},$.unshift(c[d]=c[d]||[],f),$.push(a._triggers,f)})})}})}})}function _create(a){var b=this,c={},d=$.create(b.handleNodeTree);return d.currentNode=$.DOM.clone(shadowBody),$.pushByID(c,d),_traversal(d,function(a,b,e){if(a=$.pushByID(c,$.create(a)),a.ignore)return _traversal(a,function(a){a=$.pushByID(c,$.create(a))}),!1;var f=c[e.id].currentNode||d.currentNode,g=a.currentNode=$.DOM.clone(a.node);$.DOM.append(f,g)}),$.forEach(b._handles,function(a){a.call(b,c)}),ViewInstance(b.handleNodeTree,c,b._triggers,a)}function _bubbleTrigger(a,b,c,d){var e=this;$.forEach(a,function(a){if(a.event(b,c,d),a.bubble){var f=b[a.handleId].parentNode;f&&_bubbleTrigger.apply(e,[f._triggers,b,c,a])}})}function _replaceTopHandleCurrent(a,b){var c=a.handleNodeTree,d=a.NodeList;a._canRemoveAble=!0,d[c.id].currentNode=b}function Handle(a,b){var c=this;return c instanceof Handle?(a&&(c.type=a),$.forIn(b,function(a,b){c[b]=a}),void 0):new Handle(a,b)}function TemplateHandle(a,b){var c=this;return c instanceof TemplateHandle?(c.handleName=$.trim(a),c.childNodes=_parse(b),Handle.init(c,3),void 0):new TemplateHandle(a,b)}function ElementHandle(a){var b=this;return b instanceof ElementHandle?(b.node=a,b.childNodes=_parse(a),Handle.init(b,3),void 0):new ElementHandle(a)}function TextHandle(a){var b=this;return b instanceof TextHandle?(b.node=a,Handle.init(b,2),void 0):new TextHandle(a)}function CommentHandle(a){var b=this;return b instanceof CommentHandle?(b.node=a,Handle.init(b,1),void 0):new CommentHandle(a)}function parseRule(a){var b=a.replace(/</g,placeholder["<"]).replace(/>/g,placeholder[">"]).replace(placeholderReg["/{"],placeholder["{"]).replace(placeholderReg["/("],placeholder["("]).replace(placeholderReg["/)"],placeholder[")"]).replace(placeholderReg["/}"],placeholder["}"]).replace(_head,"<span type='handle' handle='$1'>").replace(_footer,"</span>").replace(placeholderReg["{"],"{").replace(placeholderReg["("],"(").replace(placeholderReg[")"],")").replace(placeholderReg["}"],"}");return b}var global=this,shadowBody=document.createElement("body"),shadowDIV=document.createElement("div"),$={id:100,uidAvator:Math.random().toString(36).substring(2),noop:function(){},uid:function(){return this.id=this.id+1},isString:function(a){var b=a.charAt(0);return b===a.charAt(a.length-1)&&-1!=="'\"".indexOf(b)},trim:function(a){a=a.replace(/^\s\s*/,"");for(var b=/\s/,c=a.length;b.test(a.charAt(--c)););return a.slice(0,c+1)},push:function(a,b){return a[a.length]=b,b},unshift:function(a,b){a.splice(0,0,b)},slice:function(a){var b;try{b=Array.prototype.slice.call(a,0)}catch(c){b=[];for(var d=0,e=a.length;e>d;d++)b.push(a[d])}return b},pushByID:function(a,b){return a[b.id]=b,b},lastItem:function(a){return a[a.length-1]},insert:function(a,b,c){a.splice(b,0,c)},insertAfter:function(a,b,c){for(var d=0;d<a.length;d+=1)if(a[d]===b){a.splice(d+1,0,c);break}return d},indexOf:function(a,b){for(var c=0;c<a.length;c+=1)if(a[c]===b)return c;return-1},bind:function(a,b){if("function"!=typeof a)throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var c=Array.prototype.slice.call(arguments,2),d=a,e={},f=a.constructor.name,g=a.name;return e[f]=function(){},e[g]=function(){return d.apply(this instanceof e[f]&&b?this:b,c.concat(Array.prototype.slice.call(arguments)))},e[g].toString=function(){return a.toString()},e[f].prototype=a.prototype,e[g].prototype=new e[f],e[g]},forIn:function(a,b){for(var c in a)b(a[c],c,a)},reverseEach:function(a,b,c){return a?this._each($.slice(a).reverse(),b,a.length-1-c):void 0},forEach:function(a,b,c){return a?this._each($.slice(a),b,c):void 0},_each:function(a,b,c){for(c=c||0;c<a.length&&b(a[c],c,a)!==!1;c+=1);},create:function(a){return _Object_create_noop.prototype=a,new _Object_create_noop},DOM:{Comment:function(a){return document.createComment(a)},insertBefore:function(a,b,c){a.insertBefore(b,c||null)},append:function(a,b){a.appendChild(b)},clone:function(a,b){return a.cloneNode(b)},removeChild:function(a,b){b=b||a.parentNode,b&&b.removeChild(a)},replace:function(a,b,c){try{a.replaceChild(b,c)}catch(d){}},traversal:_traversal}},_Object_create_noop=function(){},_traversal=function(a,b){for(var c,d=0,e=a.childNodes;c=e[d];d+=1){var f=b(c,d,a);1===c.nodeType&&f!==!1&&_traversal(c,b)}},_attrRegExp=/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g,_isIE=!1,_event_by_fun=!0,IEfix={acceptcharset:"acceptCharset",accesskey:"accessKey",allowtransparency:"allowTransparency",bgcolor:"bgColor",cellpadding:"cellPadding",cellspacing:"cellSpacing","class":"className",colspan:"colSpan",checked:"defaultChecked",selected:"defaultSelected","for":"htmlFor",frameborder:"frameBorder",hspace:"hSpace",longdesc:"longDesc",maxlength:"maxLength",marginwidth:"marginWidth",marginheight:"marginHeight",noresize:"noResize",noshade:"noShade",readonly:"readOnly",rowspan:"rowSpan",tabindex:"tabIndex",valign:"vAlign",vspace:"vSpace"},_comment_reg=/<!--[\w\W]*?-->/g,ViewInstance=function(a,b,c,d){if(!(this instanceof ViewInstance))return new ViewInstance(a,b,c,d);var e=this;e.handleNodeTree=a,e.DOMArr=$.slice(a.childNodes),e.NodeList=b,e._database=d||{},e._database.set=function(){e.set.apply(e,$.slice(arguments))},e._database.get=function(){e.get.apply(e,$.slice(arguments))};var f=b[a.id].currentNode;e._packingBag=f,e._id=$.uid(),e._open=$.DOM.Comment(e._id+" _open"),e._close=$.DOM.Comment(e._id+" _close"),e._canRemoveAble=!1,$.DOM.insertBefore(f,e._open,f.childNodes[0]),$.DOM.append(f,e._close),e._triggers={},e.TEMP={},$.forIn(c,function(a,b){e._triggers[b]=a}),$.forEach(e._triggers["."],function(a){a.event(b,d)}),e.reDraw()};ViewInstance.prototype={reDraw:function(){var a=this,b=a._database;$.forIn(b,function(b,c){/get|set/.test(c)||a.set(c,b)})},append:function(a){var b=this,c=b.handleNodeTree,d=b.NodeList,e=d[c.id].currentNode;$.forEach(e.childNodes,function(b){$.DOM.append(a,b)}),_replaceTopHandleCurrent(b,a)},insert:function(a){var b=this,c=b.handleNodeTree,d=b.NodeList,e=d[c.id].currentNode,f=a.parentNode;$.forEach(e.childNodes,function(b){$.DOM.insertBefore(f,b,a)}),_replaceTopHandleCurrent(b,f)},remove:function(){var a=this,b=this._packingBag;if(a._canRemoveAble){var c=a.handleNodeTree,d=a.NodeList,e=d[c.id].currentNode,f=a._open,g=a._close,h=0;$.forEach(e.childNodes,function(a,b){a===f&&(h=b)}),$.forEach(e.childNodes,function(a){return $.DOM.append(b,a),a===g?!1:void 0},h),_replaceTopHandleCurrent(a,b),this._canRemoveAble=!1}},get:function(a){var b=this,c=b._database;return c[a]},set:function(a,b){var c=this,d=c._database,e=c.NodeList,f=d[a];f!=b&&(c._database[a]=b),_bubbleTrigger.apply(c,[c._triggers[a],e,d])}};var _parse=function(a){for(var b,c=[],d=0,e=a.childNodes;b=e[d];d+=1)switch(b.nodeType){case 3:$.trim(b.data)&&$.push(c,TextHandle(b));break;case 1:if("span"===b.tagName.toLowerCase()&&"handle"===b.getAttribute("type")){var f=b.getAttribute("handle");null!==f&&$.push(c,TemplateHandle(f,b))}else $.push(c,ElementHandle(b))}return c};Handle.init=function(a,b){a.id=$.uid(),2>b||(a._controllers=[],a._controllers[!0]=[],a._controllers[!1]=[],3>b||(a._triggers=[]))},Handle.prototype={nodeType:0,ignore:!1,display:!1,childNodes:[],parentNode:null,type:"handle"},TemplateHandle.prototype=Handle("handle",{ignore:!0,nodeType:1}),ElementHandle.prototype=Handle("element",{nodeType:1}),TextHandle.prototype=Handle("text",{nodeType:3}),CommentHandle.prototype=Handle("comment",{nodeType:8});var _placeholder=function(){return"@"+Math.random().toString(36).substring(2)},placeholder={"<":"&lt;",">":"&gt;","{":_placeholder(),"(":_placeholder(),")":_placeholder(),"}":_placeholder()},_Rg=function(a){return RegExp(a,"g")},placeholderReg={"<":/</g,">":/>/g,"/{":/\\\{/g,"{":_Rg(placeholder["{"]),"/(":/\\\(/g,"(":_Rg(placeholder["("]),"/)":/\\\)/g,")":_Rg(placeholder[")"]),"/}":/\\\}/g,"}":_Rg(placeholder["}"])},_head=/\{([\w\W]*?)\(/g,_footer=/\)[\s]*\}/g,_matchRule=/\{[\w\w]*?\([\w\W]*?\)[\s]*\}/,V=global.ViewParser={prefix:"attr-",parse:function(a){var b=$.DOM.clone(shadowBody);b.innerHTML=a;var c=[];_traversal(b,function(a,b,d){3===a.nodeType&&$.push(c,{baseNode:a,parentNode:d,insertNodesHTML:parseRule(a.data)})}),$.forEach(c,function(a){var b=a.baseNode,c=a.parentNode;insertNodesHTML=a.insertNodesHTML,shadowDIV.innerHTML=insertNodesHTML,$.forEach(shadowDIV.childNodes,function(a){$.DOM.insertBefore(c,a,b)}),c.removeChild(b)}),b.innerHTML=b.innerHTML;var d=ElementHandle(b);return View(d)},scans:function(){$.forEach(document.getElementsByTagName("script"),function(a){"text/template"===a.getAttribute("type")&&(V.modules[a.getAttribute("name")]=V.parse(a.innerHTML))})},registerTrigger:function(a,b){V.triggers[a]=b},registerHandle:function(a,b){V.handles[a]=b},triggers:{},handles:{},modules:{},attrModules:{},eachModules:{}};V.registerHandle("",function(a,b,c){var d=a.childNodes[0];if("handle"!==c.type){var e=0;do{e+=1;var f=c.childNodes[b+e]}while(f&&f.ignore);if(d)return $.insertAfter(c.childNodes,a,d),function(a){var b=f&&a[f.id].currentNode,e=a[d.id].currentNode,g=a[c.id].currentNode;$.DOM.insertBefore(g,e,b)}}else d&&(d.ignore=!0)});var _commentPlaceholder=function(a,b){var c=a.handleName,d=$.DOM.Comment(c+a.id),e=CommentHandle(d);return $.push(a.childNodes,e),$.insertAfter(b.childNodes,a,e),e},placeholderHandle=function(a,b,c){_commentPlaceholder(a,c)};V.registerHandle("#if",placeholderHandle),V.registerHandle("#else",placeholderHandle),V.registerHandle("/if",placeholderHandle);var _each_display=function(a,b){var c,d=this,e=d.parentNode,f=d.arrViewInstances;$.forEach(e.childNodes,function(a,b,e){return a.id===d.id?(c=e[b+3].id,!1):void 0}),a?$.forEach(f,function(a,e){return a.insert(b[c].currentNode),d.len===e+1?!1:void 0}):$.forEach(f,function(a){a.remove()})};V.registerHandle("#each",function(a,b,c){var d=$.DOM.clone(shadowBody),e=ElementHandle(d),f=0;a.arrViewInstances=[],a.len=0,$.forEach(c.childNodes,function(a,b){return f=b,"/each"===a.handleName?!1:($.push(e.childNodes,a),void 0)},b+1),c.childNodes.splice(b+1,f-b-1),V.eachModules[a.id]=View(e),a.display=_each_display,_commentPlaceholder(a,c)}),V.registerHandle("/each",placeholderHandle),V.registerTrigger("#if",function(a,b,c){var d,e,f,g=a.id,h=a.childNodes[0].id,i=c.id,j=a._controllers,k=!0,l=0;return $.forEach(c.childNodes,function(a){if("#if"===a.handleName)l+=1;else if("#else"===a.handleName)1===l&&(k=!k,d=$.lastItem(a.childNodes).id);else if("/if"===a.handleName){if(l-=1,!l)return e=$.lastItem(a.childNodes).id,!1}else"comment"!==a.type&&($.push(a._controllers,g),$.push(j[k],a.id))},b),f={event:function(a,b,c){var f,g=!!a[h]._data,k=a[i].currentNode,l=d;(a[this.handleId]._data!==g||c)&&(a[this.handleId]._data=g,g||(l=e),l&&(f=a[l].currentNode),$.forEach(j[g],function(d){var e=a[d],f=e.currentNode,g=a[d].placeholderNode=a[d].placeholderNode||$.DOM.Comment(d),h=!0;$.forEach(e._controllers,function(b){var c=a[b];return h=h&&-1!==$.indexOf(c._controllers[c._data?!0:!1],e.id)}),h&&(e.display?e.display(!0,a,b,c):f&&$.DOM.replace(k,f,g))}),$.forEach(j[!g],function(d){var e=a[d],f=e.currentNode,g=e.placeholderNode=e.placeholderNode||$.DOM.Comment(d);e.display?e.display(!1,a,b,c):f&&$.DOM.replace(k,g,f)}))}}}),V.registerTrigger("#each",function(a,b,c){var d,e=a.id,f=a.childNodes[0].childNodes[0].node.data,g=c.childNodes[b+3].id,h=a.arrViewInstances;return d={event:function(b,d){var i,j=d[f],k=0;$.forEach(j,function(a,c){h[c]||(h[c]=V.eachModules[e](),i=!0);var d=h[c];d._canRemoveAble||(i=!0),$.forIn(a,function(a,b){d.get(b)!==a&&d.set(b,a)}),i&&d.insert(b[g].currentNode),k=c}),k+=1,$.forEach(h,function(a){a.NodeList[a.handleNodeTree.id].currentNode=b[c.id].currentNode,a.remove()},k);var l=f+".length";d.get(l)!==k&&(d.set(l,k),a.len=k)}}}),V.registerTrigger("",function(a,b,c){var d,e=a.childNodes[0],f=e.id,g=e.node.data;return d="handle"!==c.type?{key:g,event:function(a,b){a[f].currentNode.data=b[g]}}:$.isString(g)?{key:".",bubble:!0,event:function(a){a[this.handleId]._data=g.substring(1,g.length-1)}}:{key:g,bubble:!0,event:function(a,b){a[this.handleId]._data=b[g]}}});var _equal=function(a){var b,c=[];return $.forEach(a.childNodes,function(a){"handle"===a.type&&$.push(c,a.id)}),b={bubble:!0,event:function(a){var b,d=a[c[0]]._data;$.forEach(c,function(c){return b=a[c]._data==d,b?!1:void 0},1),a[this.handleId]._data=!!b}}};V.registerTrigger("equa",_equal),V.registerTrigger("==",_equal);var _nagete=function(a){var b,c=a.childNodes[0].id;return b={bubble:!0,event:function(a){a[this.handleId]._data=!a[c]._data}}};V.registerTrigger("nega",_nagete),V.registerTrigger("!",_nagete),function(){for(var a,b=function(){},c=["assert","clear","count","debug","dir","dirxml","error","exception","group","groupCollapsed","groupEnd","info","log","markTimeline","profile","profileEnd","table","time","timeEnd","timeStamp","trace","warn"],d=c.length,e=window.console=window.console||{};d--;)a=c[d],e[a]||(e[a]=b)}();