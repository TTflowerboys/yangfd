//
//  CUTEPropertyInfoForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPropertyInfoForm.h"
#import "CUTECommonMacro.h"
#import "CUTEFormImagePickerCell.h"
#import "CUTEFormButtonCell.h"

@implementation CUTEPropertyInfoForm

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"photo", FXFormFieldTitle:STR(@"添加照片"), FXFormFieldHeader: STR(@"房间照片"), FXFormFieldCell: [CUTEFormImagePickerCell class]},
                @{FXFormFieldKey: @"propertyType", FXFormFieldTitle:STR(@"房产类型"), FXFormFieldHeader: STR(@"基本信息")},
                @{FXFormFieldKey: @"bedroom", FXFormFieldTitle:STR(@"居室"), FXFormFieldCell: [FXFormStepperCell class]},
                @{FXFormFieldKey: @"area", FXFormFieldTitle:STR(@"面积")},
                @{FXFormFieldKey: @"rentPrice", FXFormFieldTitle:STR(@"租金")},
                @{FXFormFieldKey: @"moreInfo", FXFormFieldTitle:STR(@"填写更多描述")},
             ];
}

- (NSArray *)extraFields {
    return @[
             @{FXFormFieldKey: @"submit", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:STR(@"预览并发布"), FXFormFieldHeader: @"", FXFormFieldAction: @""},
             ];
}

@end
