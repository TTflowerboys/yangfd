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

@interface CUTERentContactForm () {
    NSArray *_allCountries;
}

@end


@implementation CUTERentContactForm

- (instancetype)init
{
    self = [super init];
    if (self) {
        static dispatch_once_t onceToken;
        dispatch_once(&onceToken, ^{
            [[self class] validationInit];
        });
    }
    return self;
}


- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"name", FXFormFieldTitle: STR(@"姓名"), FXFormFieldHeader: STR(@"填写联系方式")},
             @{FXFormFieldKey: @"email", FXFormFieldTitle: STR(@"邮箱")},
             @{FXFormFieldKey: @"country", FXFormFieldTitle: STR(@"国家"), FXFormFieldOptions: _allCountries, FXFormFieldDefaultValue: _country? _country: (CUTEEnum *)[_allCountries firstObject]},
              @{FXFormFieldKey: @"phone", FXFormFieldTitle: STR(@"手机号")},
             @{FXFormFieldKey: @"code", FXFormFieldTitle: STR(@"手机验证码"), FXFormFieldCell: [CUTEFormVerificationCodeCell class],FXFormFieldCell: @"codeFieldEndEdit"},
             ];
}

- (void)setAllCountries:(NSArray *)allCountries {
    _allCountries = allCountries;
}

- (NSArray *)rules {
    return @[
             @{
                 FXModelValidatorAttributes : @[@"name", @"email", @"country", @"phone"],
                 FXModelValidatorType: @"required",
                 FXModelValidatorOn: @[@"register"]
                 },
             @{
                 FXModelValidatorAttributes: @[@"country", @"phone"],
                 FXModelValidatorType: @"required",
                 FXModelValidatorOn: @[@"sendCode"]
                 },
             @{
                 FXModelValidatorAttributes : @"email",
                 FXModelValidatorType : @"email",
                 FXModelValidatorOn: @[@"register"],
                 },
             ];
}


@end
