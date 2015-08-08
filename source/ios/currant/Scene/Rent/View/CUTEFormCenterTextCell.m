//
//  CUTEFormCenterTextCell.m
//  currant
//
//  Created by Foster Yin on 5/6/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormCenterTextCell.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"

static void SetCellSeperatorToLeft(UITableViewCell* cell)
{
    if ([cell respondsToSelector:@selector(setSeparatorInset:)]) {
        [cell setSeparatorInset:UIEdgeInsetsZero];
    }

    if ([cell respondsToSelector:@selector(setLayoutMargins:)]) {
        [cell setLayoutMargins:UIEdgeInsetsZero];
    }

    if([cell respondsToSelector:@selector(setPreservesSuperviewLayoutMargins:)]){
        [cell setPreservesSuperviewLayoutMargins:NO];
    }
}

@implementation CUTEFormCenterTextCell

+ (CGFloat)heightForField:(FXFormField *)field width:(CGFloat)width
{
    return CUTE_CELL_DEFAULT_HEIGHT;
}

- (void)update {
    [super update];

//    SetCellSeperatorToLeft(self);
    if (self.textColor) {
        self.textLabel.textColor = self.textColor;
    }

}

- (void)layoutSubviews {
    [super layoutSubviews];

    CGSize textSize = TextSizeOfLabel(self.textLabel);
    self.textLabel.frame = CGRectMake(RectWidthExclude(self.bounds, textSize.width) / 2, RectHeightExclude(self.bounds, textSize.height)/ 2, textSize.width, textSize.height);

}

@end
