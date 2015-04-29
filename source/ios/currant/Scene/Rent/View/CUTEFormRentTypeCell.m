//
//  CUTEFromRentTypeCell.m
//  currant
//
//  Created by Foster Yin on 4/1/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormRentTypeCell.h"
#import "CUTECommonMacro.h"

@implementation CUTEFormRentTypeCell

+ (CGFloat)heightForField:(FXFormField *)field width:(CGFloat)width
{
    return 56;
}

- (void)update {
    [super update];
    if (self.field) {
        [self.imageView setImage:IMAGE(CONCAT(@"rent-type-", self.field.key))];
    }
}

- (void) layoutSubviews
{
    [super layoutSubviews];
    self.imageView.frame = CGRectMake(16, 15, 28, 28);
}



@end
