//
//  CUTEMapTextField.m
//  currant
//
//  Created by Foster Yin on 4/3/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEMapTextField.h"

@implementation CUTEMapTextField

- (CGRect)textRectForBounds:(CGRect)bounds
{
    CGRect rect = [super textRectForBounds:bounds];
    rect.origin.x = rect.origin.x + 16;
    rect.size.width = rect.size.width - 32;
    return rect;

}

- (CGRect)rightViewRectForBounds:(CGRect)bounds{
    CGRect rect = [super rightViewRectForBounds:bounds];
    rect.origin.x = rect.origin.x - 18;
    return rect;
}

@end
