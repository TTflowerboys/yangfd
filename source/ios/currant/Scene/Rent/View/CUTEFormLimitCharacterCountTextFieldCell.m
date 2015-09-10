//
//  CUTEFormLimitCharacterCountTextFieldCell.m
//  currant
//
//  Created by Foster Yin on 5/12/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormLimitCharacterCountTextFieldCell.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTECommonMacro.h"

@implementation CUTEFormLimitCharacterCountTextFieldCell

- (BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string {
    NSString *newString = [textField.text stringByReplacingCharactersInRange:range withString:string];
    if (newString && newString.length > self.limitCount && newString.length > textField.text.length) {
        [SVProgressHUD showErrorWithStatus:[NSString stringWithFormat:@"%@ %ld", STR(@"LimitCharacterCountTextFieldCell/超过长度限制"), (long)self.limitCount]];
        return NO;
    }
    // for all other cases, proceed with replacement
    return [super textField:textField shouldChangeCharactersInRange:range replacementString:string];
}


@end
