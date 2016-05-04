//
//  CUTEFromCurrencyTextFieldCell.m
//  currant
//
//  Created by Foster Yin on 7/25/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormCurrencyTextFieldCell.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"
#import "NSString+Numberic.h"

@implementation CUTEFormCurrencyTextFieldCell


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
    if (!IsNilNullOrEmpty(self.textField.text) && [self.textField.text rangeOfString:self.currencySymbol].location == NSNotFound) {
        self.textField.text = CONCAT(self.currencySymbol, self.textField.text);
    }
    else {
        self.textField.text = nil;
    }
}

- (BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string {
    if (![string isNumeric]) {
        return NO;
    }
    return YES;
}

- (void)textFieldDidBeginEditing:(__unused UITextField *)textField
{
    NSRange currencyRange = [textField.text rangeOfString:self.currencySymbol];
    if (currencyRange.location != NSNotFound) {
        textField.text = [textField.text substringFromIndex:currencyRange.location + currencyRange.length];
    }
    [super textFieldDidBeginEditing:textField];
}

- (void)textFieldDidEndEditing:(__unused UITextField *)textField
{
    [super textFieldDidEndEditing:textField];

    if (IsNilNullOrEmpty(textField.text)) {
        textField.text = nil;
    }
    else {
        NSRange currencyRange = [textField.text rangeOfString:self.currencySymbol];
        if (currencyRange.location == NSNotFound) {
            textField.text = CONCAT(self.currencySymbol, textField.text);
        }
    }
}

@end
