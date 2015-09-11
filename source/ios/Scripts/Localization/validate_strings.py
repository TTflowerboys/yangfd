#!/bin/env python
#-*- coding: utf-8 -*-

import sys

original_file_path = sys.argv[1]
modified_file_path = sys.argv[2]
lang = sys.argv[3]

# zh_mark = u'。，、＇：∶；?‘’“”〝〞ˆˇ﹕︰﹔﹖﹑·¨….¸;！´？！～—ˉ｜‖＂〃｀@﹫¡¿﹏﹋﹌︴々﹟#﹩$﹠&﹪%*﹡﹢﹦﹤‐￣¯―﹨ˆ˜﹍﹎+=<＿_-\ˇ~﹉﹊（）〈〉‹›﹛﹜『』〖〗［］《》〔〕{}「」【】︵︷︿︹︽_﹁﹃︻︶︸﹀︺︾ˉ﹂﹄︼'
zh_mark = u'\u3002\uff0c\u3001\uff07\uff1a\u2236\uff1b?\u2018\u2019\u201c\u201d\u301d\u301e\u02c6\u02c7\ufe55\ufe30\ufe54\ufe56\ufe51\xb7\xa8\u2026.\xb8;\uff01\xb4\uff1f\uff01\uff5e\u2014\u02c9\uff5c\u2016\uff02\u3003\uff40@\ufe6b\xa1\xbf\ufe4f\ufe4b\ufe4c\ufe34\u3005\ufe5f#\ufe69$\ufe60&\ufe6a%*\ufe61\ufe62\ufe66\ufe64\u2010\uffe3\xaf\u2015\ufe68\u02c6\u02dc\ufe4d\ufe4e+=<\uff3f_-\\\u02c7~\ufe49\ufe4a\uff08\uff09\u3008\u3009\u2039\u203a\ufe5b\ufe5c\u300e\u300f\u3016\u3017\uff3b\uff3d\u300a\u300b\u3014\u3015{}\u300c\u300d\u3010\u3011\ufe35\ufe37\ufe3f\ufe39\ufe3d_\ufe41\ufe43\ufe3b\ufe36\ufe38\ufe40\ufe3a\ufe3e\u02c9\ufe42\ufe44\ufe3c'

en_mark = '.?!:;-—( )[ ]. . .’“ ”/,'

invalid_mark = ''
if lang == 'zh':
    invalid_mark = en_mark
else:
    invalid_mark = zh_mark

original_file = open(original_file_path)
original_lines = original_file.readlines()

modified_file = open(modified_file_path)
modified_lines = modified_file.readlines()


def get_key_value(line):
    parts = line.split(' = ')
    value = parts[1][1:-3]
    key = parts[0][1:-1]
    return (key, value)


def validate_formatter(fmt, key, value):
    if fmt in key:
        if key.count('%d') != value.count('%d'):
            return False
    return True

# validate sytax error for modified_file

# compare line numbers are same

if len(modified_lines) != len(original_lines):
    print "Line Count not match error"
    print "original line count "
    print len(original_lines)
    print "new line count "
    print len(modified_lines)
    exit(-1)

# compare keys are same
# compare % related key-value has correct numbers of %

counter = 0
for line in original_lines:
    if line.startswith('"'):
        (key, value) = get_key_value(line)
        new_line = modified_lines[counter]
        (new_key, new_value) = get_key_value(new_line)
        if key != new_key:
            print "Bad Key error"
            print key
            print new_key
            print '\n'

        for fmt in ['%d', '%l', '%lf', '%@']:
            if not validate_formatter(fmt, new_key, new_value):
                print "Miss formatter " + fmt
                print new_key
                print new_value
                print '\n'

        for mark in invalid_mark:
            if mark not in unicode('.-+()%?\\', 'utf-8') and mark in unicode(new_value, 'utf-8'):
                print "Bad mark " + mark
                print new_value
                print '\n'

    counter = counter + 1
