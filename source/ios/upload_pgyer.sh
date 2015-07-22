#！ /bin/sh

file=$1
curl -F "file=@$file" -F "uKey=0738035e57b3a2f3bc617759fb02fc85" -F "_api_key=79b75ad26abe9450f0612b729de24b30" -F "publishRange=2" http://www.pgyer.com/apiv1/app/upload