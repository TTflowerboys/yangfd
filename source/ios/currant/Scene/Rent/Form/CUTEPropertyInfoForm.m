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
#import "CUTEFormRoomsPickerCell.h"
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
             @{FXFormFieldKey: @"rentPrice", FXFormFieldTitle:STR(@"租金"), FXFormFieldAction: @"editRentPrice", FXFormFieldHeader: STR(@"基本信息")},
                @{FXFormFieldKey: @"propertyType", FXFormFieldTitle:STR(@"房产类型"),FXFormFieldOptions: _allPropertyTypes, FXFormFieldDefaultValue: [self defaultPropertyType], FXFormFieldAction: @"editPropertyType"},
             @{FXFormFieldKey: @"rooms", FXFormFieldTitle:STR(@"房间"), FXFormFieldCell: [CUTEFormRoomsPickerCell class], @"style": @(1), FXFormFieldAction: @"editRooms:"},
                @{FXFormFieldKey: @"area", FXFormFieldTitle:STR(@"面积"), FXFormFieldAction: @"editArea"},
             @{FXFormFieldKey: @"rentType", FXFormFieldTitle:STR(@"出租类型"), FXFormFieldAction: @"editRentType"},
             @{FXFormFieldKey: @"location", FXFormFieldTitle:STR(@"位置"), FXFormFieldCell: [FXFormDefaultCell class], FXFormFieldAction: @"editLocation"},
             @{FXFormFieldKey: @"moreInfo", FXFormFieldTitle:STR(@"填写更多描述（选填）"), FXFormFieldAction: @"editMoreInfo"},
             @{FXFormFieldKey: @"submit", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:STR(@"预览并发布"), FXFormFieldHeader: @"", FXFormFieldAction: @"submit"},
             ];
}

- (CUTEEnum *)defaultPropertyType {
    if (_propertyType) {
        return _propertyType;
    }

    __block CUTEEnum *apartment = nil;
    [_allPropertyTypes enumerateObjectsUsingBlock:^(CUTEEnum *obj, NSUInteger idx, BOOL *stop) {
        if (obj.slug && [obj.slug isEqualToString:@"apartment"]) {
            apartment = obj;
        }
    }];
    if (apartment) {
        return apartment;
    }
    return [_allPropertyTypes firstObject];
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
