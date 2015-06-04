//
//  CUTEFormShareButtonCell.m
//  currant
//
//  Created by Foster Yin on 4/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormShareButtonCell.h"
#import "CUTECommonMacro.h"

@implementation CUTEFormShareButtonCell

- (void)setUp {
    [super setUp];
    self.backgroundColor = HEXCOLOR(0x8acd24, 1);
    self.textLabel.text = STR(@"分享");
    self.textLabel.textColor = [UIColor whiteColor];
}


#define TEXT_LEFT_MARGIN 12

- (void)layoutSubviews {
    [super layoutSubviews];

    self.textLabel.textColor = [UIColor whiteColor];
    CGSize textSize = TextSizeOfLabel(self.textLabel);
    
    CGFloat leftMargin = (self.contentView.bounds.size.width - textSize.width) / 2;
    self.textLabel.frame = CGRectMake(leftMargin, (self.contentView.bounds.size.height - textSize.height) / 2, textSize.width, textSize.height);
}

@end
