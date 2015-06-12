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
             @{FXFormFieldKey: @"displayPhone", FXFormFieldTitle: STR(@"展示电话"), FXFormFieldCell: [CUTEFormSwitchCell class]},
             @{FXFormFieldKey: @"displayEmail", FXFormFieldTitle: STR(@"展示邮箱"), FXFormFieldCell: [CUTEFormSwitchCell class]},
             @{FXFormFieldKey: @"wechat", FXFormFieldTitle: STR(@"微信号"), FXFormFieldCell: [CUTEFormTextFieldCell class], FXFormFieldFooter:STR(@"您选择的联系方式仅展示给平台注册的租客")}
             ];
}

- (NSError *)validateFormWithScenario:(NSString *)scenario {
    if (!self.displayPhone && !self.displayEmail && IsNilNullOrEmpty(self.wechat)) {
        return [NSError errorWithDomain:@"CUTE" code:-1 userInfo:@{NSLocalizedDescriptionKey: STR(@"请至少展示一种联系方式给租客")}];
    }
    return nil;
}

@end
