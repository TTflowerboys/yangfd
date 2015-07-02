#!/bin/sh

xctool -workspace currant.xcworkspace -scheme currantUITest test -only $1 -sdk iphonesimulator
