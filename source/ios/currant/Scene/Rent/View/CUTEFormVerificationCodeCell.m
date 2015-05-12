//
//  CUTEFromVerificationCodeCell.m
//  currant
//
//  Created by Foster Yin on 4/9/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormVerificationCodeCell.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"

#define VERIFICATION_BUTTON_WIDTH 67

@implementation CUTEFormVerificationCodeCell

+ (CGFloat)heightForField:(FXFormField *)field width:(CGFloat)width
{
    return CUTE_CELL_DEFAULT_HEIGHT;
}

- (void)setUp {
    [super setUp];
    self.textLabel.textColor = HEXCOLOR(0x333333, 1.0);
    self.textLabel.font = [UIFont systemFontOfSize:16];

    self.verificationButton = [UIButton buttonWithType:UIButtonTypeCustom];
    [self.verificationButton setTitle:STR(@"获取") forState:UIControlStateNormal];
    self.verificationButton.backgroundColor = CUTE_MAIN_COLOR;
    [self.contentView addSubview:self.verificationButton];
}

- (void)layoutSubviews {
    [super layoutSubviews];
    self.verificationButton.frame = CGRectMake(RectWidthExclude(self.contentView.bounds, VERIFICATION_BUTTON_WIDTH), 0, VERIFICATION_BUTTON_WIDTH, RectHeight(self.contentView.bounds));
    self.textField.frame = RectSetWidth(self.textField.frame, 100);

}

@end
