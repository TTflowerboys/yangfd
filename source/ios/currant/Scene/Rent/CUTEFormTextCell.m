//
//  CUTEFormTextCell.m
//  currant
//
//  Created by Foster Yin on 4/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormTextCell.h"
#import "CUTECommonMacro.h"

@implementation CUTEFormTextCell

- (void)update {
    [super update];

    self.textLabel.font = [UIFont systemFontOfSize:16];
    self.textLabel.textColor = HEXCOLOR(0x555555, 1);
}

- (void)layoutSubviews {
    [super layoutSubviews];
    self.textLabel.font = [UIFont systemFontOfSize:16];
    self.textLabel.textColor = HEXCOLOR(0x555555, 1);
//    [self setNeedsLayout];
}

@end
