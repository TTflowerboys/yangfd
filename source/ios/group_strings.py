#!/bin/env python

import sys

file_name = sys.argv[1]

group_dic = {}
cur_group = ''

for line in open(file_name):
    if line.startswith('//Group:'):
        cur_group = line.split(': ')[1][0:-1]
    elif cur_group and len(line.replace('\n', '')):
        if not group_dic.has_key(cur_group):
            group_dic[cur_group] = []
        array = group_dic[cur_group]
        if line.startswith('//Filepath:'):
            array.append('\n')
            array.append(line)
        else:
            array.append(line)

for (key, value) in group_dic.items():
    print "\n\n//"
    print "//Group: " + key
    print "//",
    for line in value:
        print line,
