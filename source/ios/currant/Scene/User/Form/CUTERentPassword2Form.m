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
#import <NGRValidator/NGRValidator.h>

@implementation CUTERentPassword2Form

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"email", FXFormFieldTitle: STR(@"RentPassword2/邮箱"), FXFormFieldCell: [CUTEFormTextFieldCell class]},
             @{FXFormFieldKey: @"reset", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:STR(@"RentPassword2/请求重置密码"), FXFormFieldHeader: @"", FXFormFieldAction: @"reset"},
             ];
}

- (NSError *)validateFormWithScenario:(NSString *)scenario {
    NSError *error = nil;
    [NGRValidator validateModel:self error:&error delegate:nil rules:^NSArray *{
        return @[
                 NGRValidate(@"email").required().syntax(NGRSyntaxEmail),
                 ];
    }];

    return error;
}

@end
