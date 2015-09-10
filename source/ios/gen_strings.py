#!/bin/env python

import sys
import re
from sets import Set

search_result_file_name = sys.argv[1]
func_pattern = re.compile(r'STR\(@\"(.*?)\"\)')


def get_file_path(file_path):
    path = file_path.split(':')[0]
    return path


def get_file_key(file_path):
    key = file_path.split(':')[0].split('.')[0].split('/').pop()
    key = key.replace("CUTE", "")
    key = key.replace("BBT", "")
    key = key.replace("ViewController", "")
    key = key.replace("View", "")
    key = key.replace("Form", "")
    key = key.replace("SVProgressHUD", "")
    key = key.replace("+", "")
    return key


def check_file_need_gen(file_path):
    return not file_path.startswith('currantUITest')


def get_localization_key(file_line):
    array = func_pattern.findall(file_line)
    if array:
        return array
    return []


previous_file_key = ''
previous_localization_key_set = Set([])

for line in open(search_result_file_name):
    array = line.rstrip('\n').split(':    ')
    if len(array) is 2:
        file_path = get_file_path(array[0])
        file_key = get_file_key(array[0])
        localization_key_array = get_localization_key(array[1])
        if check_file_need_gen(file_path) and localization_key_array:
            if previous_file_key != file_key:
                previous_localization_key_set = Set([])
                print '\n\n'
                print "//Group: " + file_key
                print "//Filepath: " + file_path
            previous_file_key = file_key

            for localization_key in localization_key_array:
                if localization_key not in previous_localization_key_set:
                    print "\"" + file_key + "/" + localization_key + "\" = \"" + localization_key + "\";"
                previous_localization_key_set.add(localization_key)
    # else:
        # print "error"
        # print line
