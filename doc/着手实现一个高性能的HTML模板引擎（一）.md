## 序言
这是在再造车轮么？你可以这样认为哦，但我并不觉得。
最流行的模板引擎[Handlebars](http://handlebarsjs.com/)，很强大。风格的设定非常好，它的风格是HTML语义风格，也是结构化的。而类似MVW框架Angularjs和MVVM框架avalon内部的模板引擎，是混淆HTML语义的，或者说功能弱一些。
比如：
```html
{{#each arr_A}}
    {{#each arr_B}}
        <p>{{name}}</p>
    {{/each}}
{{/each}}
```
这种HTML结构要Angularjs或者avalon来实现是不可能的，因为他们的结构依赖与HTML语句必须同步出现（我觉得avalon是因为childrens和childNodes的问题才会这样）。
然而最大的问题是Handlebars的文件大小，因为其庞大的语义功能……这是在逗我好么，你不支持事件绑定，而且每次数据改变还要完全重绘？好吧我承认如果有jQuery帮助你可以把重绘的范围轻松变小，但我还是不得不吐槽一句“花瓶”！

我只需要Handlebars一半的功能，因为我用不到高级功能，我也希望文件小一点……[artTemplate](https://github.com/aui/artTemplate)确实实现了，很小，不过真的太小了，你以为我会在意这2KB和30KB之间的差距么？这年头的网速，这么小的文件，功能缺得太有个性了。真的比Handlebars还花瓶。

当然还有很多框架都有HTML模板引擎，有的很好很强大，但是不是独立存在的引擎。所以到头来我打算手动自己做一个。

做一个花瓶？这么可能，要的是真正的高效！高效是什么概念？就是别像Handlebars一样动不动就```document.bodu.innerHTML="...";```这是中国啊，你以为这样很快乐么？绑定的事件呢！？？

## 目标
1. 确保一次编译，多次使用
2. 最大效率地重用DOM，把重绘精确到Attribute和innerText！
3. 暴露出的书写风格尽量保持单一功能原则，又要控制API的数量

## 风格设定
刚才夸了Handlebars的书写风格，所以打算模仿了，花括号已经是javascript模板引擎的默认规范了，虽然没有规定，但是`<% %>`、`<!-- -->`之类的就留给后台网站。别跟我谈自定义风格，为什么？真的有必要么？不争议……
但为了确保目标中的第三点，我最后的风格定位成：
```html
My name is {{name}}.
```
不要吐槽，这是真的，只有一种风格写法，它的伪代码是：
```js
View.handle[""](["name"]);
```
也就是说：
```html
I am a {#if{ {equa{ {{sex}}{{'woman'}} }} }}girl{#else{}}boy{/if{}}.
```
将被解析成：
```js
[
	"I'm a ",
	V.Handle["#if"]( [V.Handle["#eque"]( [V.Handle[""](["sex"]),V.Handle[""](]"'woman'"])] )] ),
	"girl",
	V.Handle["else"](),
	"boy",
	V.Handle["/if"]([]),
	"."
]
```
意思已经很明确`{...{`之间写的是Handle名称，`{}`之间放的是参数数组。
这真不是故意学Lisp风格，可以优化，但现在就只用这一种写法来搞基础。

## 至上而下思考

刚才那只是伪代码，真的情况呢？想想if功能，它需要和else跟endif来控制他们的兄弟节点。
但是我们的目标第一点很明显了，只能编译一次，然后可以多次实例化。这里就有一个矛盾点了，就是我编译一次后，所有Handle跟着编译好，但并没有相应的示例给予控制。这里就要用到javascript的动态特性来实现了，我后来的实现方案是bind。
> 至于为什么不用原型法来绑定示例的this？因为事件规模比较大，用原型法结构太死，事件的灵活性很重要，上面那个if就看的出来，这是要冒泡触发更新的。如果真的要用原型法，还得另外做一个关系集，虽然说省内存，但是很抽象，对于初期开发调试很困难。真要变动的话，跟上面的风格设定一样，尽肯能保持模块的独立性，方便后期用更好的实现替换（恐怕是没有后期了……）

### 解析模板语句
```js
function parseRule(str) {
	var parseStr = str
		.replace(/\{([\w\W]*?)[\{\}]/g, "<span type='handle' handle='$1'>")
		.replace(/\}[\s]*\}/g, "</span>");
	return parseStr;
};
```
没错你没有看错，我就是要把模板直接解析成HTML……至于为什么，我又不在做花瓶，我需要把语句精确的定位到某个节点！你觉得我放这浏览器内置的结构解析功能不用自己去实现解析，然后一堆createElement？

当然你可能又要问了：那属性绑定怎么办？
比如：
```html
<input value="{{name}}">
```
当然是分开来了……
```js
shadowBody = document.createElement("body");
shadowDIV = document.createElement("div");

function parse(htmlStr) {
    shadowBody.innerHTML = htmlStr;
    var insertBefore = [];
//_traversal的功能是遍历一个DOM对象
    _traversal(shadowBody, function(node, index, parentNode) {
        if (node.nodeType === 3) {
//把所有的文本节点进行结构解析，获取到解析后的所有子节点
            shadowDIV.innerHTML = parseRule(node.textContent);
            $.push(insertBefore, {
                baseNode: node,
                parentNode: parentNode,
                insertNodes: [].slice.call(shadowDIV.childNodes)
            });
        }
    });
//然后把文本节点进行相应的替换
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
}
```
> 另外补充一下最后一句：` return View(result);` 。风格我用的是通用的风格：构造函数首字母大写，所有的构造函数内部又有这么一段代码：
```js
    if (!(this instanceof Contructor)) {//你可以用argument.callee来替代Contructor，通用性更高
        return new Contructor(/*args*/);
    }
```
因为我懒得到处写 `new`……
