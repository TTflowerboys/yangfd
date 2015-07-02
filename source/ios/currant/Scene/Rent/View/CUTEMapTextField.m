//
//  CUTEMapTextField.m
//  currant
//
//  Created by Foster Yin on 4/3/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEMapTextField.h"
#import "MasonryMake.h"
#import "CUTECommonMacro.h"

@implementation CUTEMapTextField

- (instancetype)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        _indicatorView = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleGray];
        [self addSubview:_indicatorView];
        _indicatorView.accessibilityLabel = @"MapTextFieldIndicator";
    }
    return self;
}

#define kIndicatorSideLength 20

- (void)layoutSubviews {
    [super layoutSubviews];
    _indicatorView.frame = CGRectMake(RectWidthExclude(self.bounds, kIndicatorSideLength) / 2, RectHeightExclude(self.bounds, kIndicatorSideLength) / 2, kIndicatorSideLength, kIndicatorSideLength);
}

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
