#!/bin/env python

import sys
from RNCryptor import RNCryptor


password = "OG> t[*['sL;[^R%/1$K!yMLuDc$ou"
file_name = sys.argv[1]
encrypted_file_name = sys.argv[2]

file = open(file_name, 'r')
content = file.read()
file.close()

cryptor = RNCryptor()
encrypted_data = cryptor.encrypt(content, password)

encrypted_file = open(encrypted_file_name, 'w+')
encrypted_file.write(bytearray(encrypted_data))
encrypted_file.close()
