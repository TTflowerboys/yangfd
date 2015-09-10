#!/bin/sh

CURRENT_DIR=`pwd`
cd $CURRENT_DIR

find currant/** -name "*.h" | xargs ~/bin/yasobjc.rb -o snippets/objc-mode

#http://stackoverflow.com/questions/16758525/use-xargs-with-filenames-containing-whitespaces
find Pods -name "*.h" -print0 | xargs -0 ~/bin/yasobjc.rb -o snippets/objc-mode