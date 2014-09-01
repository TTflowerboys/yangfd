# Currant

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
	1. ✖︎ 将某对象命名为 `data`，（大部分变量都是数据（data））
	2. ✖︎ 将某 bool 变量命名为 `flag`。（所有 bool 都是标志（flag））
	3. ✖︎ 将某函数命名为 `operate()`。（所有函数都是操作（operate））
