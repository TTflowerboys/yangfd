# PrePods.sh
# M37
# Created by Rick Luo on 2013-07-22.
# Copyright (c) 2013 BBTechgroup. All rights reserved.

#!/bin/bash

# Prepare cocoapods

export LC_ALL="en_US.UTF-8"

# Fix a break after January 30th 2014, there is a break in CocoaPods causing this
# http://stackoverflow.com/questions/18224627/error-on-pod-install
# http://blog.cocoapods.org/Repairing-Our-Broken-Specs-Repository/
# pod repo remove master
# pod setup

if [ ! -f Podfile.lock ];
then
	echo "Podfile.lock not exists. Installing."
	echo ""
	pod install
else
	echo "Podfile.lock exists. Updating."
	echo ""
	pod update
fi
