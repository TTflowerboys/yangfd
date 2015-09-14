#!/bin/env python

import sys
import re
import string
import unicodedata

file_path = sys.argv[1]


def replace(file, pattern, subst):
    # Read contents from file as a single string
    file_handle = open(file, 'r')
    file_string = file_handle.read()
    file_handle.close()

    # Use RE package to allow for replacement (also allowing for (multiline) REGEX)
    file_string = (re.sub(pattern, subst, file_string))

    # Write contents to file.
    # Using mode 'w' truncates the file.
    file_handle = open(file, 'w')
    file_handle.write(file_string)
    file_handle.close()


def remove_control_characters(s):
    # return "".join(ch for ch in s if unicodedata.category(ch)[0] != "C")
    return lambda s: "".join(i for i in s if 31 < ord(i) < 127)


file = open(file_path, 'r')
filtered_string = remove_control_characters(file.read())
file.close
file = open(file_path, 'w')
file.write(filtered_string)
file.close
