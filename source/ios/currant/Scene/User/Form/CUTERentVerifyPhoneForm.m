//
//  CUTERentVerifyPhoneForm.m
//  currant
//
//  Created by Foster Yin on 7/29/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentVerifyPhoneForm.h"
#import "CUTEFormVerificationCodeCell.h"
#import "CUTECommonMacro.h"
#import "CUTEFormButtonCell.h"

@implementation CUTERentVerifyPhoneForm

- (NSArray *)fields {

    NSMutableArray *fields = [NSMutableArray arrayWithArray:@[@{FXFormFieldKey: @"code", FXFormFieldTitle: STR(@"手机验证码"), FXFormFieldCell: [CUTEFormVerificationCodeCell class],FXFormFieldAction: @"onCodeEdit:"},  @{FXFormFieldKey: @"submit", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:STR(@"验证"), FXFormFieldHeader: @"", FXFormFieldAction: @"submit"}]];

    return fields;
}

@end
