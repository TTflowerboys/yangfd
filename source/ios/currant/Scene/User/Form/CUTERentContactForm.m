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
#import "CUTEFormTextFieldCell.h"
#import "CUTEFormCenterTextCell.h"
#import "CUTEFormDefaultCell.h"
#import "CUTEUIMacro.h"

@interface CUTERentContactForm () {
    NSArray *_allCountries;
}

@end


@implementation CUTERentContactForm


- (NSArray *)fields {

    NSMutableArray *fields = [NSMutableArray arrayWithArray:@[@{FXFormFieldKey: @"login", FXFormFieldTitle: STR(@"RentContact/登录"), FXFormFieldHeader: STR(@"RentContact/已有帐号"), FXFormFieldCell: [CUTEFormCenterTextCell class], @"textLabel.textColor": CUTE_MAIN_COLOR, FXFormFieldAction: @"login"},
                                                              @{FXFormFieldKey: @"name", FXFormFieldTitle: STR(@"RentContact/姓名"), FXFormFieldHeader: STR(@"RentContact/还没有帐号？10秒创建"), FXFormFieldCell: [CUTEFormTextFieldCell class]},
                                                              @{FXFormFieldKey: @"email", FXFormFieldTitle: STR(@"RentContact/邮箱"), FXFormFieldCell: [CUTEFormTextFieldCell class]},
//                                                              @{FXFormFieldKey: @"invitationCode", FXFormFieldTitle: STR(@"邀请码"), FXFormFieldCell: [CUTEFormTextFieldCell class]},
                                                              @{FXFormFieldKey: @"country", FXFormFieldTitle: STR(@"RentContact/国家"), FXFormFieldOptions: _allCountries, FXFormFieldDefaultValue: _country? _country: (CUTECountry *)[_allCountries firstObject], FXFormFieldAction: @"optionBack"},
                                                              @{FXFormFieldKey: @"phone", FXFormFieldTitle: STR(@"RentContact/手机号"), FXFormFieldCell: [CUTEFormTextFieldCell class]},
                                                              @{FXFormFieldKey: @"code", FXFormFieldTitle: STR(@"RentContact/手机验证码"), FXFormFieldCell: [CUTEFormVerificationCodeCell class],FXFormFieldAction: @"codeFieldEndEdit"},
                                                              @{FXFormFieldKey: @"submit", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle: STR(@"RentContact/发布并分享到微信"), FXFormFieldHeader: @"", FXFormFieldAction: @"submit"},
                                                              ]];

     [fields insertObject:@{FXFormFieldKey: @"displaySetting", FXFormFieldTitle: STR(@"RentContact/联系方式展示"), FXFormFieldCell: [CUTEFormTextCell class], FXFormFieldAction: @"onDisplaySettingPressed:"} atIndex:[fields count] - 1];

    return fields;
}

- (void)setAllCountries:(NSArray *)allCountries {
    _allCountries = allCountries;
}

- (NSError *)validateFormWithScenario:(NSString *)scenario {
    NSError *error = nil;
    NSMutableArray *validateFields = nil;
    if ([scenario isEqualToString:@"fetchCode"]) {
        validateFields = [NSMutableArray arrayWithArray:@[NGRValidate(@"name").required(),
                                                          NGRValidate(@"email").required().syntax(NGRSyntaxEmail),
                                                          NGRValidate(@"phone").required(),
                                                          ]];
    }
    else {
        validateFields = [NSMutableArray arrayWithArray:@[NGRValidate(@"name").required(),
                                                          NGRValidate(@"email").required().syntax(NGRSyntaxEmail),
                                                          NGRValidate(@"phone").required(),
                                                          NGRValidate(@"code").required()
                                                          ]];
    }

    [NGRValidator validateModel:self error:&error delegate:nil rules:^NSArray *{
        return validateFields;
    }];


    return error;
}

@end
