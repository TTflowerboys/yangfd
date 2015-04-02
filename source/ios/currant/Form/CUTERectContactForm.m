//
//  CUTERectContactForm.m
//  currant
//
//  Created by Foster Yin on 4/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERectContactForm.h"
#import "CUTECommonMacro.h"

@implementation CUTERectContactForm

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"name", FXFormFieldTitle: STR(@"姓名"), FXFormFieldHeader: STR(@"填写联系方式")},
              @{FXFormFieldKey: @"phone", FXFormFieldTitle: STR(@"手机号")},
              @{FXFormFieldKey: @"code", FXFormFieldTitle: STR(@"手机验证码")},
              @{FXFormFieldKey: @"email", FXFormFieldTitle: STR(@"邮箱")},
             ];
}

@end
