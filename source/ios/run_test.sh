#!/bin/sh

xctool -workspace currant.xcworkspace -scheme currantUITest run-tests -only $1 -sdk iphonesimulator
