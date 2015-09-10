//
//  CUTERentPasswordForm.m
//  currant
//
//  Created by Foster Yin on 5/18/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPasswordForm.h"
#import "CUTECommonMacro.h"
#import "CUTEFormTextFieldCell.h"
#import "CUTEFormVerificationCodeCell.h"
#import "CUTEFormButtonCell.h"

@interface CUTERentPasswordForm () {
    NSArray *_allCountries;
}

@end

@implementation CUTERentPasswordForm


- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"country", FXFormFieldTitle: STR(@"RentPassword/国家"), FXFormFieldOptions: _allCountries, FXFormFieldDefaultValue: _country? _country: (CUTEEnum *)[_allCountries firstObject], FXFormFieldAction: @"optionBack"},
             @{FXFormFieldKey: @"phone", FXFormFieldTitle: STR(@"RentPassword/手机号"), FXFormFieldCell: [CUTEFormTextFieldCell class]},
             @{FXFormFieldKey: @"code", FXFormFieldTitle: STR(@"RentPassword/手机验证码"), FXFormFieldCell: [CUTEFormVerificationCodeCell class]},
             @{FXFormFieldKey: @"password", FXFormFieldTitle: STR(@"RentPassword/新密码"), FXFormFieldCell: [CUTEFormTextFieldCell class]},
             @{FXFormFieldKey: @"confirmPassword", FXFormFieldTitle: STR(@"RentPassword/确认新密码"), FXFormFieldCell: [CUTEFormTextFieldCell class]},
             @{FXFormFieldKey: @"reset", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:STR(@"RentPassword/重置"), FXFormFieldHeader: @"", FXFormFieldAction: @"reset"},
             ];
}

- (void)setAllCountries:(NSArray *)allCountries {
    _allCountries = allCountries;
}

- (NSError *)validateFormWithScenario:(NSString *)scenario {
    NSError *error = nil;
    if ([scenario isEqualToString:@"fetchCode"]) {
        [NGRValidator validateModel:self error:&error delegate:nil rules:^NSArray *{
            return @[
                     NGRValidate(@"phone").required(),
                     ];
        }];
    }
    else {
        [NGRValidator validateModel:self error:&error delegate:nil rules:^NSArray *{
            return @[NGRValidate(@"phone").required(),
                     NGRValidate(@"code").required(),
                     NGRValidate(@"password").required(),
                     NGRValidate(@"confirmPassword").required().match(self.password)
                     ];
        }];
    }

    return error;
}


@end
