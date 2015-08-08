//
//  CUTERentPassword2Form.m
//  currant
//
//  Created by Foster Yin on 8/8/15.
//  Copyright © 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPassword2Form.h"
#import "CUTECommonMacro.h"
#import "CUTEFormTextFieldCell.h"
#import "CUTEFormVerificationCodeCell.h"
#import "CUTEFormButtonCell.h"

@implementation CUTERentPassword2Form

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"email", FXFormFieldTitle: STR(@"邮箱"), FXFormFieldCell: [CUTEFormTextFieldCell class]},
             @{FXFormFieldKey: @"code", FXFormFieldTitle: STR(@"邮箱验证码"), FXFormFieldCell: [CUTEFormVerificationCodeCell class]},
             @{FXFormFieldKey: @"password", FXFormFieldTitle: STR(@"新密码"), FXFormFieldCell: [CUTEFormTextFieldCell class]},
             @{FXFormFieldKey: @"confirmPassword", FXFormFieldTitle: STR(@"确认新密码"), FXFormFieldCell: [CUTEFormTextFieldCell class]},
             @{FXFormFieldKey: @"reset", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:STR(@"重置"), FXFormFieldHeader: @"", FXFormFieldAction: @"reset"},
             ];
}

@end
