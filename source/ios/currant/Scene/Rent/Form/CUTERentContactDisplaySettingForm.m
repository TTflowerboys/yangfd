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

@end
