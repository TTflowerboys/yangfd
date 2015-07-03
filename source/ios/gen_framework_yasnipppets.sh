#!/bin/sh

FRAMEWORK_DIR="/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS8.3.sdk/System/Library/Frameworks"
YASOBJC="~/bin/yasobjc.rb"
SNIPPETS_DIR="~/.emacs.d/snippets/objc-mode"

find $FRAMEWORK_DIR -name "*.h" | xargs ~/bin/yasobjc.rb -o ~/.emacs.d/snippets/objc-mode
