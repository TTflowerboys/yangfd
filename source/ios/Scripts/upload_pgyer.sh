#！ /bin/sh

file=$1

# http://unix.stackexchange.com/questions/26426/how-do-i-get-the-http-status-of-a-site-in-bash
HTTP_STATUS=$(curl -w "%{http_code}" -s --output /dev/null  -F "file=@$file" -F "uKey=0738035e57b3a2f3bc617759fb02fc85" -F "_api_key=79b75ad26abe9450f0612b729de24b30" -F "publishRange=2" http://www.pgyer.com/apiv1/app/upload)

if [ "${HTTP_STATUS}" = "200" ] ; then
    echo "Upload OK"
	curl -X POST --data-urlencode 'payload={"channel": "#publish", "username": "pgyer.com", "text": "New Build Update. Download http://www.pgyer.com/BVzn", "icon_emoji": ":u6709:"}' https://hooks.slack.com/services/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
	echo "Post Message OK"
fi
