//
//  UIImage+CalculatedSize.m
//  currant
//
//  Created by Foster Yin on 5/22/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "UIImage+CalculatedSize.h"

@implementation UIImage (CalculatedSize)

-(NSUInteger)calculatedSize
{
    return CGImageGetHeight(self.CGImage) * CGImageGetBytesPerRow(self.CGImage);
}

@end
