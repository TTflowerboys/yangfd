//
//  CUTEMapTextField.m
//  currant
//
//  Created by Foster Yin on 4/3/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEMapTextField.h"

@implementation CUTEMapTextField

- (CGRect)editingRectForBounds:(CGRect)bounds
{
    CGRect rect = [super editingRectForBounds:bounds];
    rect.origin.x = rect.origin.x + 4;
    rect.size.width = rect.size.width - 8;
    return rect;

}

- (CGRect)leftViewRectForBounds:(CGRect)bounds
{
    CGRect rect = [super leftViewRectForBounds:bounds];
    rect.origin.x = 18;
    return rect;
}

- (CGRect)rightViewRectForBounds:(CGRect)bounds{
    CGRect rect = [super rightViewRectForBounds:bounds];
    rect.origin.x = rect.origin.x - 18;
    return rect;
}

@end
