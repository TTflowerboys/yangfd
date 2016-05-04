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
#import "SVProgressHUD+CUTEAPI.h"
#import "NSString+Numberic.h"

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
        self.textField.text = CONCAT(self.currencySymbol, self.textField.text, @"/", STR(@"RentPriceTextFieldCell/周"));
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

- (BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string {
    if (![string isNumeric]) {
        return NO;
    }
    return YES;
}

- (void)textFieldDidEndEditing:(__unused UITextField *)textField
{
    [super textFieldDidEndEditing:textField];

    if (IsNilNullOrEmpty(textField.text)) {
        [SVProgressHUD showErrorWithStatus:STR(@"RentPriceTextFieldCell/租金不能为空")];
         textField.text = CONCAT(self.currencySymbol, @"0", @"/", STR(@"RentPriceTextFieldCell/周"));
    }
    else {

        NSRange slashRange = [textField.text rangeOfString:@"/"];
        if (slashRange.location == NSNotFound) {
            textField.text = CONCAT(self.currencySymbol, textField.text, @"/", STR(@"RentPriceTextFieldCell/周"));
        }
    }
}

@end
