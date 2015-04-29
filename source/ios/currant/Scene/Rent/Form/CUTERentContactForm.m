//
//  CUTERectContactForm.m
//  currant
//
//  Created by Foster Yin on 4/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentContactForm.h"
#import "CUTECommonMacro.h"
#import "CUTEFormVerificationCodeCell.h"
#import <NGRValidator.h>
#import "CUTEFormButtonCell.h"

@interface CUTERentContactForm () {
    NSArray *_allCountries;
}

@end


@implementation CUTERentContactForm


- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"name", FXFormFieldTitle: STR(@"姓名"), FXFormFieldHeader: STR(@"填写联系方式")},
             @{FXFormFieldKey: @"email", FXFormFieldTitle: STR(@"邮箱")},
             @{FXFormFieldKey: @"country", FXFormFieldTitle: STR(@"国家"), FXFormFieldOptions: _allCountries, FXFormFieldDefaultValue: _country? _country: (CUTEEnum *)[_allCountries firstObject]},
              @{FXFormFieldKey: @"phone", FXFormFieldTitle: STR(@"手机号")},
             @{FXFormFieldKey: @"code", FXFormFieldTitle: STR(@"手机验证码"), FXFormFieldCell: [CUTEFormVerificationCodeCell class],FXFormFieldAction: @"codeFieldEndEdit"},
             @{FXFormFieldKey: @"submit", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:STR(@"发布到微信"), FXFormFieldHeader: @"", FXFormFieldAction: @"submit"},
             ];
}

- (void)setAllCountries:(NSArray *)allCountries {
    _allCountries = allCountries;
}

- (NSError *)validateFormWithScenario:(NSString *)scenario {
    NSError *error = nil;
    [NGRValidator validateModel:self error:&error delegate:nil rules:^NSArray *{
        return @[NGRValidate(@"name").required(),
                 NGRValidate(@"email").required().syntax(NGRSyntaxEmail),
                 NGRValidate(@"phone").required()
                 ];
    }];
    return error;
}

@end
