#!/bin/env python
import sys

strings_file = sys.argv[1]
src_path_root = sys.argv[2]
src_file_path = ''
src_file_content = ''

str_func_prefix = 'STR(@"'
str_func_suffix = '")'


for line in open(strings_file):
    if line.startswith('//Filepath:'):
        if src_file_path != '':
            # write back
            file = open(src_path_root + '/' +src_file_path, 'w')
            file.write(src_file_content)
            file.close()

        src_file_path = line.split(': ')[1].replace('\n', '')
        with open(src_path_root + '/' + src_file_path) as file:
            src_file_content = file.read()

    elif line.startswith('"'):
        parts = line.split(' = ')
        old_key = parts[1][1:-3]
        new_key = parts[0][1:-1]
        src_file_content = src_file_content.replace(str_func_prefix + old_key + str_func_suffix, str_func_prefix + new_key + str_func_suffix)


if src_file_path != '':
    # write back
    file = open(src_file_path, 'w')
    file.write(src_file_content)
    file.close()
