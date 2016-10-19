#!/bin/env python

# Usage: python restore_old_msg.py web/en_GB.po > web/en_GB.restore.po
# mv web/en_GB.restore.po web/en_GB.po

import sys


file_name = sys.argv[1]

old_msg_dic = {}
key = ''
value = ''
for line in open(file_name):
    if line.startswith('#~ msgid'):
        key = line[3:]
        # print key
    elif line.startswith('#~ msgstr'):
        value = line[3:]
        # print value
        if len(key) & len(value):
            old_msg_dic[key] = value

previous_line = ''
for line in open(file_name):
    if len(previous_line) and previous_line.startswith('msgid ') and line.startswith('msgstr ""') and previous_line in old_msg_dic:
        print old_msg_dic[previous_line],
    else:
        print line,
    previous_line = line
