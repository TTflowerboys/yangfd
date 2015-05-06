//
//  CUTEFormCenterTextCell.m
//  currant
//
//  Created by Foster Yin on 5/6/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormCenterTextCell.h"
#import "CUTECommonMacro.h"

@implementation CUTEFormCenterTextCell

- (void)layoutSubviews {
    [super layoutSubviews];
    CGSize textSize = TextSizeOfLabel(self.textLabel);
    self.textLabel.frame = CGRectMake(RectWidthExclude(self.bounds, textSize.width) / 2, RectHeightExclude(self.bounds, textSize.height)/ 2, textSize.width, textSize.height);
}

@end
