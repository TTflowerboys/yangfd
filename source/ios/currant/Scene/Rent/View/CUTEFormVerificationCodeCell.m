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
#import <NSTimer+Blocks.h>

#define VERIFICATION_BUTTON_PADDING 20
#define TEXTFIELD_RIGHT_MARGIN 20

@interface CUTEFormVerificationCodeCell () {
    
    NSTimer *_timer;
    
}

@end


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
    CGSize textSize = TextSizeOfLabel(self.verificationButton.titleLabel);
    CGFloat buttonWidth = textSize.width + VERIFICATION_BUTTON_PADDING * 2;
    self.verificationButton.frame = CGRectMake(RectWidthExclude(self.contentView.bounds, buttonWidth), 0, buttonWidth, RectHeight(self.contentView.bounds));
    CGFloat leftMargin = RectX(self.textLabel.frame) + RectWidth(self.textLabel.frame);
    CGFloat rightMargin = TEXTFIELD_RIGHT_MARGIN + buttonWidth;
    self.textField.frame = CGRectMake(leftMargin, 0,  RectWidth(self.contentView.frame) - leftMargin - rightMargin, RectHeight(self.contentView.frame));
}

- (void)updateButtonTitle:(NSString *)title {
    [self.verificationButton setTitle:title forState:UIControlStateNormal];
    [self setNeedsLayout];
}

- (void)startCountDown {
    [self.verificationButton setEnabled:NO];
    self.verificationButton.backgroundColor = HEXCOLOR(0x999999, 1);
    
    __block int count = 60;
    __weak typeof(self)weakSelf = self;
    [weakSelf updateButtonTitle:[NSString stringWithFormat:@"%@%d%@", STR(@"剩余"), count, STR(@"秒")]];
    _timer = [NSTimer scheduledTimerWithTimeInterval:1.0 block:^{
        count = count - 1;
        if (count == 0) {
            [_timer invalidate];
            _timer = nil;
            [weakSelf updateButtonTitle:STR(@"重新发送")];
            [weakSelf.verificationButton setEnabled:YES];
            weakSelf.verificationButton.backgroundColor = CUTE_MAIN_COLOR;
        }
        else {
            [weakSelf updateButtonTitle:[NSString stringWithFormat:@"%@%d%@", STR(@"剩余"), count, STR(@"秒")]];
        }
    } repeats:YES];

}

@end
