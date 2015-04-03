#!/bin/bash

if [ $# -ne 1 ]; then
    echo usage: $0 plist-file
    exit 1
fi

plist=$1
dir=$(dirname "$plist")

buildnum=$(/usr/libexec/PlistBuddy -c "Print CFBundleVersion" "$plist")
if [ -z "$buildnum" ]; then
    echo "No build number in $plist"
    exit 2
fi
buildnum=$(expr $buildnum + 1)
/usr/libexec/Plistbuddy -c "Set CFBundleVersion $buildnum" "$plist"
echo "Incremented build number to $buildnum"

git commit -am "[ios] Add: Bumps Version"
git pull --rebase
git push origin master