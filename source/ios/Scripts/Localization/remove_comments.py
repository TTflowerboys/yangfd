#!/bin/env python

import sys

file_path = sys.argv[1]
target_path = sys.argv[2]
lines = []

target = open(target_path, 'w+')

for line in open(file_path):
    if line.startswith('"'):
        target.write(line)
        print line

target.close()
