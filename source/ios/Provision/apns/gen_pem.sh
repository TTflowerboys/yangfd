#! /bin/sh

#keychain 里导出的cert.p12 文件里面有 certificate and private key
# -nodes mean no des, it means OpenSSL will not encrypt the private key in a PKCS#12 file. http://stackoverflow.com/questions/5051655/what-is-the-purpose-of-the-nodes-argument-in-openssl

# -clcerts only outputting the certificate corresponding to the private key

openssl pkcs12 -in $1 -out $2 -nodes -clcerts


