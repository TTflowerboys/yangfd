//
//  CUTEApplyBetaRentingForm.m
//  currant
//
//  Created by Foster Yin on 5/26/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEApplyBetaRentingForm.h"
#import "CUTECommonMacro.h"
#import "CUTEFormTextFieldCell.h"
#import "CUTEFormButtonCell.h"

@implementation CUTEApplyBetaRentingForm

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"email", FXFormFieldTitle: STR(@"ApplyBetaRenting/邮箱"), FXFormFieldCell: [CUTEFormTextFieldCell class], FXFormFieldAction: @"onEmailEdited:"},
             @{FXFormFieldKey: @"submit", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:STR(@"ApplyBetaRenting/申请"), FXFormFieldHeader: @"", FXFormFieldAction: @"submit"},
             ];
}

- (NSError *)validateFormWithScenario:(NSString *)scenario {
    NSError *error = nil;
    [NGRValidator validateModel:self error:&error delegate:nil rules:^NSArray *{
        return @[NGRValidate(@"email").required().syntax(NGRSyntaxEmail)];
    }];
    return error;
}

@end
