#!/bin/sh

# http://stackoverflow.com/questions/1068650/using-awk-to-remove-the-byte-order-mark

awk 'NR==1{sub(/^\xef\xbb\xbf/,"")}{print}' $1
