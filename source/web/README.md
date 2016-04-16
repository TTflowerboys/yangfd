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

## web目录结构说明

### src
此目录专注于开发，存放的都是源文件，不需要压缩合并。目录下主要分为：

#### src/masters
此目录存放供其他HTML模板继承的模板主框架
需要注意很多共用的js和css文件都是在这些模板中引入的
master.html中引入了这些js：

```
<script src="/static/bower_components/chosen/chosen.jquery.min.js"></script>
<script src="/static/bower_components/moment/moment.js"></script>
<script src="/static/bower_components/jquery.daterangepicker/jquery.daterangepicker.js"></script>
<script src="/static/scripts/date_range_picker_custom.js"></script>
<script src="/static/scripts/jquery.chosenPhone.js"></script>
<script src="/static/scripts/geonamesApi.js"></script>
<script src="/static/scripts/requirement_rent_popup.js"></script>
<script src="/static/scripts/resize_main.js"></script>
<script src="/static/scripts/responsivemobilemenu.js"></script>
<script src="/static/scripts/master.js"></script>
<script src="/static/scripts/site_header.js"></script>
<script src="/static/scripts/i18n.js"></script>
<script src="/static/scripts/signin_modal.js"></script>
<script src="/static/scripts/requirement_popup.js"></script>
<script src="/static/scripts/project/float_bar_position.js"></script>
```
还引入了 `js_base.html` 中的js 

#### src/partials
此目录存放HTML模板中提取出的可以共用的部分，被其他模板引用

#### src/static
此目录存放静态资源文件

#### src/static/admin
存放Dashboard的资源文件

#### src/static/admin/emails
存放求租咨询单中用到的邮件模板，可以在Dashboard中渲染到求租咨询单详情页的编辑框中编辑

#### src/static/admin/scripts
存放Dashboard脚本文件

#### src/static/admin/scripts/config
* config.js 存放Angular全局设置的文件
* errors.js 存放Dashboard错误码信息的文件
* http_interceptor.js http请求拦截器,对http请求错误进行处理
* states.js Dashboard路由文件

#### src/static/admin/scripts/controllers
存放Dashboard的controller的目录

#### src/static/admin/scripts/directives
存放directive的目录

* add_dynamic.js 求租咨询单中添加动态和发送短信输入框
* btn_go_back.js 返回按钮指令
* chosen.js 封装Chosen插件的指令(Chosen is a library for making long, unwieldy select boxes more friendly. http://harvesthq.github.io/chosen/)
* edit_date.js 日期输入
* edit_datetime.js 日期时间输入
* edit_message.js 载入短信模板到文本输入框中供管理员编辑
* edit_remark.js 房产，咨询单，用户等添加和编辑备注
* edit_synonyms.js 编辑同义词
* edit_user_dict.js 编辑用户自定义词
* editable_property.js 将一个字段变为可编辑的字段并编辑该字段
* show_dynamic.js 展示求租咨询单中的动态列表
* tooltip.js bootstrap的tooltip封装

#### src/static/admin/scripts/factories
存放服务端API封装和工具函数，其中misc.js中是封装的工具函数，其他以_api.js结尾的文件是服务端API的封装

#### src/static/admin/scripts/filters
存放filter的目录
* boolean.js 将布尔值转换成 ‘yes’ 或者 ‘no’
* boolean_chinese.js 将布尔值转换成 ‘是’ 或者 ‘否’
* capitalize.js 首字母大写
* country_name.js 输入Object类型的country，输出其名字，例如 `｛code: 'CN'｝`输出 `中国`
* intention_ticket_status_name.js 输入求租咨询单的状态，输出其状态名
* key_names.js 输入一个status和一个如`/Users/levy/Gitlab/currant/source/web/src/static/admin/scripts/values/coupon_status.js`中的couponStatus的数组，输出其对应的name
* keys.js 输入一个collection和一个key，输出key在其中对应的value的array
* property_address.js 输入一个房产的item，输出格式化的地址
* remove_protocol.js 删除url中的协议头部分
* rent_intention_ticket_status_name.js 输入求租咨询单的status，输出其对应的状态名
* rent_ticket_status_name.js 输入出租房产的status，输出其对应的状态名
* show_bedroom.js 格式化房间数（将`0`格式化为`studio`，其他数字原样输出）
* show_last_dynamic.js 在求租咨询单列表页使用，展示求租咨询单的最新一条动态
* time_period.js 格式化时期
* user_referrer.js 将用户来源的id转化为对应的enum中的value
* values.js 输入一个string格式的key和一个object，输出object[key]

#### src/static/admin/scripts/values
存放Dashboard上用到的常量，主要是一些status和type对应名称的collection
值得注意的是enum_types.js中存放了http://yangfd.com/admin?_i18n=zh_Hans_CN#/dashboard/enums/normal 的enum，如果要添加一种新的enum type，一般需要在enum_types.js中添加

#### src/static/admin/scripts/modal
弹出一个确认框，使用方法如下：
```
fctModal.show("Do you want to remove it?", void 0, function() {
    api.remove(item.id).success(function() {
        $scope.list.splice($scope.list.indexOf(item), 1)
    })
})
```

#### src/static/admin/templates
存放Dashboard模板文件

#### src/static/admin/templates/message
存放求租咨询单中用到的短信模板

#### src/static/bower_components
存放bower安装的依赖包，在web/bower.json中设置了该路径

#### src/static/emails
存放在服务端渲染的邮件模板，大部分继承了web/src/masters/email.html 或 web/src/masters/email_new.html

#### src/static/fonts
存放字体文件

#### src/static/fonts/icon_font
存放网站用到的icon font字体文件和由 `https://icomoon.io/app/#/` 导出的json文件，如需更新字体，需要到 `https://icomoon.io/app/#/` 中 import `selection.json` 文件，在线编辑后导出文件，更新该目录下的字体文件和 `selection.json` ，并且更新 `web/src/static/styles/iconFont.less` 文件

#### src/static/images
存放图片文件

#### src/static/scripts
存放js文件
值得注意的有下面这些文件
* common_ko.js 定义了公用的knockout组件，和父ViewModel：`window.currantModule.appViewModel`，各页面的ViewModel都是 `window.currantModule.appViewModel` 的属性，例如 `web/src/static/scripts/index.js` 中定义了 `window.currantModule.appViewModel.indexViewModel` 就是 `web/src/index.html` 的 ViewModel


### dist
此目录为编译生成目录，用于部署环境，目录结构和src保持一致。

