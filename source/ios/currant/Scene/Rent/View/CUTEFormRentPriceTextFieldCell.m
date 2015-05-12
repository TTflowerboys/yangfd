//
//  CUTEFormRentPriceTextFieldCell.m
//  currant
//
//  Created by Foster Yin on 4/14/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormRentPriceTextFieldCell.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"

@implementation CUTEFormRentPriceTextFieldCell

+ (CGFloat)heightForField:(FXFormField *)field width:(CGFloat)width
{
    return CUTE_CELL_DEFAULT_HEIGHT;
}

- (void)update {
    [super update];
    self.textLabel.textColor = HEXCOLOR(0x333333, 1.0);
    self.textLabel.font = [UIFont systemFontOfSize:16];
}

- (void)setField:(FXFormField *)field {
    [super setField:field];
}

- (void)setCurrencySymbol:(NSString *)currencySymbol {
    _currencySymbol = currencySymbol;
    NSRange slashRange = [self.textField.text rangeOfString:@"/"];
    if (slashRange.location == NSNotFound) {
        self.textField.text = CONCAT(self.currencySymbol, self.textField.text, @"/", STR(@"周"));
    }
}

- (void)textFieldDidBeginEditing:(__unused UITextField *)textField
{
    NSRange currencyRange = [textField.text rangeOfString:self.currencySymbol];
    NSRange slashRange = [textField.text rangeOfString:@"/"];
    if (slashRange.location != NSNotFound) {
        textField.text = [textField.text substringWithRange:NSMakeRange(currencyRange.location + currencyRange.length, slashRange.location - (currencyRange.location + currencyRange.length))];
    }
    [super textFieldDidBeginEditing:textField];
}

- (void)textFieldDidEndEditing:(__unused UITextField *)textField
{
    [super textFieldDidEndEditing:textField];

    NSRange slashRange = [textField.text rangeOfString:@"/"];
    if (slashRange.location == NSNotFound) {
        textField.text = CONCAT(self.currencySymbol, textField.text, @"/", STR(@"周"));
    }
}

@end
