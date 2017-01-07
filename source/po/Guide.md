# i18n Guide for Web User

## html file(*.html, *.py)

### Simple use
	
	{{_('清空日期')}

### String with one single var

	 {{_('%s至 ') %value}

### String with multiple vars(Work well when var order changed)

	% params =  {"role": role, "username": username, "message": message, "reply_url": reply_url}
	{{_(u'洋房东：[提醒] 来自 {role} {username} 的 “{message}”。回复请点击 {reply_url}').format(**params)}}
	
### String with html tags

	  {{!_('有房出租？去<a href="#" onclick="window.bridge.callHandler(&quot;createRentTicket&quot;);return false;" data-need-bridge>发布出租房</a>吧')}}
	 
Note
	1. must use **!** in the begin, mean do not treat the content as a string, treat it as a html content
	2. better use single quote abround whole text, so we don't need to escape double quote in the content.

	
## js file(*.js, *.tpl.html)

### Simple use

    window.i18n('合适') 	
	
### String with one var

    window.i18n('%s开始', ticket.rent_budget_min.value)

	
### String with multiple vars(Not work when var order changed)

    window.i18n('%s至%s', [ticket.rent_budget_min.value, ticket.rent_budget_max.value])
	

### String with multiple vars(Work well when var order changed)

    window.i18n('{time}s后可再次获取{content}', {time: 3, content: "test"})

	
### String with html tags

#### js

	window.i18n('邮箱已被使用！请 <a href="#" onclick="project.goToSignIn()">“登录”</a> 或者 <a href="#" onclick="project.goToResetPassword()">“找回密码”</a>')
	
#### underscore template(also the remember!)

	{!window.i18n('邮箱已被使用！请 <a href="#" onclick="project.goToSignIn()">“登录”</a> 或者 <a href="#" onclick="project.goToResetPassword()">“找回密码”</a>')!}

# Guide for Script Runner

1. activate the currant virtual_env
2. **make all**