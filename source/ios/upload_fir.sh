#!/bin/sh
 
#
# Upload ipa file to fir.im
#
# Syntax: upload_fir.sh {my-application.ipa}
#
 
IPA=$1
 
if [ -z "$IPA" ]
then
	echo "Syntax: upload_fir.sh {my-application.ipa}"
	exit 1
fi
 
USER_TOKEN="80725080d68411e4863db6915ed2fa1440cf8ace"
APP_ID="com.bbtechgroup.currant"
 
echo "getting token"
 
INFO=`curl http://fir.im/api/v2/app/info/${APP_ID}?token=${USER_TOKEN} 2>/dev/null`
KEY=$(echo ${INFO} | grep "pkg.*url" -o | grep "key.*$" -o | awk -F '"' '{print $3;}')
TOKEN=$(echo ${INFO} | grep "pkg.*url" -o | grep "token.*$" -o | awk -F '"' '{print $3;}')
 
#echo key ${KEY}
#echo token ${TOKEN}
 
echo "uploading"
APP_INFO=`curl -# -F file=@${IPA} -F "key=${KEY}" -F "token=${TOKEN}" http://up.qiniu.com`
 
if [ $? != 0 ]
then
	echo "upload error"
	exit 1
fi
 
APPOID=`echo ${APP_INFO} | grep "appOid.*," -o | awk -F '"' '{print $3;}'`
 
#echo ${APP_INFO}
#echo ${APPOID}
 
curl -X PUT -d changelog="update version" http://fir.im/api/v2/app/${APPOID}?token=${USER_TOKEN}