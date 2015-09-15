//
//  CUTERentContactSettingForm.m
//  currant
//
//  Created by Foster Yin on 6/12/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentContactDisplaySettingForm.h"
#import "CUTEFormTextFieldCell.h"
#import "CUTECommonMacro.h"
#import "CUTEFormSwitchCell.h"

@implementation CUTERentContactDisplaySettingForm

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"displayPhone", FXFormFieldTitle: STR(@"RentContactDisplaySetting/展示电话"), FXFormFieldCell: [CUTEFormSwitchCell class]},
             @{FXFormFieldKey: @"displayEmail", FXFormFieldTitle: STR(@"RentContactDisplaySetting/展示邮箱"), FXFormFieldCell: [CUTEFormSwitchCell class]},
             @{FXFormFieldKey: @"wechat", FXFormFieldTitle: STR(@"RentContactDisplaySetting/微信号"), FXFormFieldPlaceholder:STR(@"RentContactDisplaySetting/点击填写微信号"), FXFormFieldCell: [CUTEFormTextFieldCell class], FXFormFieldFooter:STR(@"RentContactDisplaySetting/您选择的联系方式仅展示给平台注册的租客")}
             ];
}

- (NSError *)validateFormWithScenario:(NSString *)scenario {
    if (!self.displayPhone && !self.displayEmail && IsNilNullOrEmpty(self.wechat)) {
        return [NSError errorWithDomain:CUTE_ERROR_DOMAIN code:-1 userInfo:@{NSLocalizedDescriptionKey: STR(@"RentContactDisplaySetting/至少需要展示一种联系方式")}];
    }
    return nil;
}

@end
