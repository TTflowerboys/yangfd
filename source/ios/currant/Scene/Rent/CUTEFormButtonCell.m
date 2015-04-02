//
//  CUTEFormButtonCell.m
//  currant
//
//  Created by Foster Yin on 4/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormButtonCell.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"

@implementation CUTEFormButtonCell

- (void)setUp {
    [super setUp];
    self.button = [UIButton buttonWithType:UIButtonTypeCustom];
    [self.button setTitle:self.field.title forState:UIControlStateNormal];
    [self.button setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    [self.button setBackgroundColor:CUTE_MAIN_COLOR];
    [self.contentView addSubview:self.button];
}

- (void)layoutSubviews {
    [super layoutSubviews];
    self.button.frame = self.contentView.bounds;
}

@end
