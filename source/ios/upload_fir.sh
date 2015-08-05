#!/bin/sh
 
#
# Upload ipa file to fir.im
#
# Syntax: upload_fir.sh {my-application.ipa}
#

if which fir >/dev/null; then
    echo "Start :)"
else
    echo "Please install fir-cli sudo gem install fir-cli --no-ri --no-rdoc"
fi

IPA=$1
echo $IPA
 
USER_TOKEN="02706885a88f4c6e361e4c90d5f44380"
fir publish "$IPA" -T $USER_TOKEN
