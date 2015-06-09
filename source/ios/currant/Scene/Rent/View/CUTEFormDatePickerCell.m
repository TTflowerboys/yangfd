//
//  CUTEFormDatePickerCell.m
//  currant
//
//  Created by Foster Yin on 5/8/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormDatePickerCell.h"
#import "BBTInputAccessoryView.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"

@implementation CUTEFormDatePickerCell

+ (CGFloat)heightForField:(FXFormField *)field width:(CGFloat)width
{
    return CUTE_CELL_DEFAULT_HEIGHT;
}


- (void)update {
    [super update];
    self.textLabel.textColor = HEXCOLOR(0x333333, 1.0);
    self.textLabel.font = [UIFont systemFontOfSize:16];
    if (self.field.value && [self.field.value isKindOfClass:[NSDate class]] && fequalzero([self.field.value timeIntervalSince1970])) {
        self.detailTextLabel.text = @"";
    }
}

- (UIView *)inputAccessoryView {
    BBTInputAccessoryView *inputAccessoryView = [[BBTInputAccessoryView alloc] initWithFrame:CGRectMake(0, 0, ScreenWidth, 40)];
    inputAccessoryView.inputView = self;
    return inputAccessoryView;
}

@end
