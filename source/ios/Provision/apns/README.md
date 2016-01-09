[详情可参考链接](http://stackoverflow.com/questions/1762555/creating-pem-file-for-apns)

1. 导出 cert的p12时，不要输入密码
2. 运行 `sh gen_pem.sh xx-cert.p12 xx-cert.pem`，弹出输入密码，直接回车即可