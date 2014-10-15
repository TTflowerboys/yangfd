# Currant

## i18n

Bottle 模板中的 `{{_('文字')}}` 会自动支持多语言。但 JS 中的字符串却无法得到支持。
解决的办法是运行 

```
npm run i18n
```

这个任务会将 JS 文件中的 `i18n('文字')` 提取为 

```
<input type="hidden" id="i18n-str-文字" value="文字">
```

并保存至 i18n.html 或 i18n_admin.html。并提供如下方法供 JS 调用

```
window.i18n = function (name) {
   var input = document.getElementById('i18n-str-' + name)
   if (!input) { return name }
   return input.value
}
``` 

总而言之，界面里需要国际化的字符串只能有如下两种形式：

1. `{{_('任意字符串')}}`
2. `i18n('任意字符串')`

P.S. 上面两行中的单引号皆可替换为双引号。



## Bottle 模板

[参考文档](https://docs.google.com/a/bbtechgroup.com/document/d/1T99uqrI7_rqBi0vYYAbPTed-f9qMT9PopjEQKEt4gAY/edit)

Bottle 支持两种文件复用语法

* % include(“路径”, 变量=...)
* % rebase(“路径”, 变量=...) 和 {{!base}}

Gulp 也提供了对应的支持

* <\!-- include=路径 {"JSON":"JSON"} -->
* <\!-- master=路径 {"JSON":"JSON"} -->

## 文案规范

```
login, sign in 对应的中文：
✔︎︎ 登录
✖︎ 登陆
```

## CSS 规范

### CSS 命名

CSS 命名使用 camelCase，两个camelCase 之间可以使用下划线（`_`）连接。
CSS 命名的核心规则只有一条：影响最小化。

举例：

#### 1 不要将常用的单词作为一级选择器，如 title / header / nav / aside

```
✖︎ .title{font-weight: bold}
```


```
✔︎︎ .siteTitle{font-weight: bold} // 使用不常见的单词
✔︎︎ .article .title{font-weight: bold} // 或者将 title 作为二级选择器
```

解释：CSS 没有作用域，一旦你单独声明了 .title 的样式，那么全页面所有的 .title 都会被你影响。违背“影响最小化”原则

#### 2 不要滥用标签

```
✖︎ .nav a{color:blue}
```

```
✔︎︎ .nav > li > a{color:blue}
```

解释：如果你无法确保 .nav 的后代中所有的 a 都是蓝色的，请使用子代选择器（`>`）

## JavaScript 规范

### JavaScript 命名

1. 统一采用 camelCase，如 `renderHtml()` / `donationAmount` / `isLoading` / `active`
2. 选择正确的单词：
	1. ✔︎︎ 数字、字符串、对象变量使用名词（单数形式）命名，如 `age` / `nickname` / `responseData`
	2. ✔︎︎ 数组变量使用名词的复数形式命名，或者以 `List` / `Collection` / `Array` 等词结尾，如 users / userList
	3. ✔︎︎ Bool变量命名以形容词、be 动词或情态动词开头，如 `selected `/ `isLoading` / `canSubmit`
	4. ✔︎︎ 函数以动词开头，如 `sendRequest()` / `showAlert()` 等
	5. ✔︎︎ 事件处理函数和回调以 on / after 等介词开头，如 `onSendRequest()` / `afterShowAlert()`
3. 命名时尽量不要使用意义模糊的单词，如
	1. ✖︎ 将某对象命名为 `data`。（大部分变量都是数据（data））
	2. ✖︎ 将某 bool 变量命名为 `flag`。（所有 bool 都是标志（flag））
	3. ✖︎ 将某函数命名为 `operate()`。（所有函数都是操作（operate））
