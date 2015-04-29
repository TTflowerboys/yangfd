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

    self.imageView.image = IMAGE(@"icon-wechat");
    self.backgroundColor = HEXCOLOR(0x8acd24, 1);
    self.textLabel.text = STR(@"分享到微信");
    self.textLabel.textColor = [UIColor whiteColor];
}

#define ICON_WIDTH 27
#define ICON_HEIGHT 22
#define TEXT_LEFT_MARGIN 12

- (void)layoutSubviews {
    [super layoutSubviews];

    self.textLabel.textColor = [UIColor whiteColor];
    CGSize textSize = TextSizeOfLabel(self.textLabel);
    
    CGFloat leftMargin = (self.contentView.bounds.size.width - textSize.width - ICON_WIDTH) / 2;
    self.imageView.frame = CGRectMake(leftMargin, (self.contentView.bounds.size.height - ICON_HEIGHT) / 2, ICON_WIDTH, ICON_HEIGHT);
    self.textLabel.frame = CGRectMake(leftMargin + self.imageView.bounds.size.width + TEXT_LEFT_MARGIN , (self.contentView.bounds.size.height - textSize.height) / 2, textSize.width, textSize.height);
}

@end
