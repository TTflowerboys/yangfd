//
//  UIImage+FixJPEGRotation.h
//  currant
//
//  Created by Foster Yin on 5/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UIImage (FixJPEGRotation)

//Use png data for orientation http://stackoverflow.com/questions/22308921/fix-ios-picture-orientation-after-upload-php
- (UIImage *)fixJPEGRotation;

@end
