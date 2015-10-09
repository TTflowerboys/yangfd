##JSPatch Usage

###JSPatch命名规范
1. 对build 号为 7000 release名字为1.1.2的版本，jspatch名字为1.1.2.jpatch 或者1.1.2-7000.jspatch
2. 目录为 
	1. Dev https://currant-dev.bbtechgroup.com/static/ios_resources/
	2. Test https://currant-test.bbtechgroup.com/static/ios_resources/
	3. Production https://currant.bbtechgroup.com/static/ios_resources/

###JSPatch更新机制
1. 需不需要patch，通过/api/1/app/currant/check_update 指定platform为ios_jspatch, 来获取更新，有则更新，无则不需要执行代码, version 传build number，release传版本号，保证获取的是这个版本号下面的，
2. 获取最新的patch，对于一个version，可以靠更改 url来，指定不同的patch，如果以前的patch有问题需要更新，则新建一个patch，然后把url填进去
3. 如果想关闭patch，则删除这个version的package就好，这样能实现回退
4. 本地可以缓存patch，如果缓存的patch的名字与服务器指定的相同，则使用本地patch，如果不同，则则用服务器指定的patch路径再下载一次

####总结
1. 由release参数指定版本，由version参数的每一package，指定patch文件的内容

###Issues

#### 1
 version 1.0有一个patch
 version 2.0有一个patch，打开2.0这个patch时不希望version 1.0获取这个patch，应该仍然获取他自己的这个

##Reference
[JSPatch 部署安全策略](http://blog.cnbang.net/tech/2879/)

 http://currant-dev.bbtechgroup.com/api/1/app/currant/check_update?platform=ios_jspatch&channel=dev&release=1.1.2&version=1


