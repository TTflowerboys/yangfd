//
//  CUTELoginForm.m
//  currant
//
//  Created by Foster Yin on 4/29/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentLoginForm.h"
#import "CUTECommonMacro.h"
#import <NGRValidator.h>
#import "CUTEFormButtonCell.h"
#import "CUTEFormTextFieldCell.h"
#import "CUTEFormDefaultCell.h"
#import "CUTEFormCenterTextCell.h"
#import "CUTEUIMacro.h"
#import "CUTEFormViewController.h"

@interface CUTERentLoginForm () {
    NSArray *_allCountries;
}

@end

@implementation CUTERentLoginForm


- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"country", FXFormFieldTitle: STR(@"国家"), FXFormFieldOptions: _allCountries, FXFormFieldDefaultValue: _country? _country: (CUTEEnum *)[_allCountries firstObject], FXFormFieldAction: @"optionBack", FXFormFieldViewController:[CUTEFormViewController class]},
             @{FXFormFieldKey: @"phone", FXFormFieldTitle: STR(@"手机号"), FXFormFieldCell: [CUTEFormTextFieldCell class]},
             @{FXFormFieldKey: @"password", FXFormFieldTitle: STR(@"密码"), FXFormFieldCell: [CUTEFormTextFieldCell class],  FXFormFieldAction: @"onPasswordEdit:"},
             @{FXFormFieldKey: @"submit", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:_isOnlyRegister? STR(@"登录"): STR(@"登录并分享到微信"), FXFormFieldHeader: @"", FXFormFieldAction: @"submit"},
             @{FXFormFieldKey: @"resetPassword", FXFormFieldTitle: STR(@"重置密码"), FXFormFieldHeader: STR(@"忘记密码？"), FXFormFieldCell: [CUTEFormCenterTextCell class], @"textLabel.textColor": CUTE_MAIN_COLOR, FXFormFieldAction: @"resetPassword"},
             ];
}

- (void)setAllCountries:(NSArray *)allCountries {
    _allCountries = allCountries;
}

- (NSError *)validateFormWithScenario:(NSString *)scenario {
    NSError *error = nil;
    [NGRValidator validateModel:self error:&error delegate:nil rules:^NSArray *{
        return @[NGRValidate(@"phone").required(),
                 NGRValidate(@"password").required()
                 ];
    }];
    return error;
}


@end
