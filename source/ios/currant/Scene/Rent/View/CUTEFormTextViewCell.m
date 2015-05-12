//
//  CUTEFormTextViewCell.m
//  currant
//
//  Created by Foster Yin on 5/8/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormTextViewCell.h"
#import "BBTInputAccessoryView.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"
#import "MasonryMake.h"
#import "UILabel+UILabelDynamicHeight.h"

@implementation CUTEFormTextViewCell

+ (CGFloat)heightForField:(FXFormField *)field width:(CGFloat)width
{
    static UITextView *textView;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        textView = [[UITextView alloc] init];
        textView.font = [UIFont systemFontOfSize:17];
    });

    textView.text = [field fieldDescription] ?: @" ";
    CGSize textViewSize = [textView sizeThatFits:CGSizeMake(width - 10 - 10, FLT_MAX)];

    CGFloat height = [field.title length]? 52: 0; // label height
    height += 12 + ceilf(textViewSize.height) + 12;
    return height;
}

- (void)update {
    [super update];
    self.textLabel.textColor = HEXCOLOR(0x333333, 1.0);
    self.textLabel.font = [UIFont systemFontOfSize:16];
}

- (void)setUp {
    [super setUp];
    BBTInputAccessoryView *inputAccessoryView = [[BBTInputAccessoryView alloc] initWithFrame:CGRectMake(0, 0, ScreenWidth, 40)];
    inputAccessoryView.inputView = self.textView;
    self.textView.inputAccessoryView = inputAccessoryView;
    self.detailTextLabel.numberOfLines = 0;

    if (IsNilNullOrEmpty(self.detailTextLabel.text)) {
        self.detailTextLabel.text = self.field.placeholder;
    }
}

- (void)layoutSubviews {
    [super layoutSubviews];
    CGSize sizeNeeded = [self.detailTextLabel sizeOfMultiLineLabel];
    self.detailTextLabel.frame = CGRectMake(self.textLabel.frame.origin.x, self.textLabel.frame.origin.y + self.textLabel.frame.size.height + 10, self.detailTextLabel.frame.size.width, ceil(sizeNeeded.height));
}

@end
