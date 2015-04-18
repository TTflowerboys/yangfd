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
#import "CUTERentContactViewController.h"
#import "CUTEPropertyMoreInfoViewController.h"
#import <NSArray+Frankenstein.h>

@interface CUTEPropertyInfoForm () {
    NSArray *_allPropertyTypes;
}

@end


@implementation CUTEPropertyInfoForm

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"photos", FXFormFieldTitle:STR(@"添加照片"), FXFormFieldHeader: STR(@"房间照片"), FXFormFieldCell: [CUTEFormImagePickerCell class], FXFormFieldType:FXFormFieldTypeImage},
                @{FXFormFieldKey: @"propertyType", FXFormFieldTitle:STR(@"房产类型"), FXFormFieldHeader: STR(@"基本信息") ,FXFormFieldOptions: _allPropertyTypes, FXFormFieldDefaultValue: _propertyType? _propertyType: (CUTEEnum *)[_allPropertyTypes firstObject]},
             @{FXFormFieldKey: @"bedroom", FXFormFieldTitle:STR(@"居室"), FXFormFieldCell: [FXFormStepperCell class], FXFormFieldDefaultValue: @(_bedroom)},
                @{FXFormFieldKey: @"area", FXFormFieldTitle:STR(@"面积"), FXFormFieldAction: @"editArea"},
                @{FXFormFieldKey: @"rentPrice", FXFormFieldTitle:STR(@"租金"), FXFormFieldAction: @"editRentPrice"},
             @{FXFormFieldKey: @"moreInfo", FXFormFieldTitle:STR(@"填写更多描述（选填）"), FXFormFieldAction: @"editMoreInfo"},
             @{FXFormFieldKey: @"submit", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:STR(@"预览并发布"), FXFormFieldHeader: @"", FXFormFieldAction: @"submit"},
             ];
}

- (void)setAllPropertyTypes:(NSArray *)allPropertyTypes {
    _allPropertyTypes = allPropertyTypes;
}

- (NSArray *)allPropertyTypeValues {
    return [_allPropertyTypes map:^id(CUTEEnum *object) {
        return [object value];
    }];
}

@end
