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
#import "CUTERentPropertyMoreInfoViewController.h"
#import <NSArray+ObjectiveSugar.h>

@interface CUTEPropertyInfoForm () {
    NSArray *_allPropertyTypes;

    NSArray *_allLandlordTypes;
}

@end


@implementation CUTEPropertyInfoForm


- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"photos", FXFormFieldTitle:STR(@"PropertyInfo/添加照片"), FXFormFieldHeader: STR(@"PropertyInfo/房间照片"), FXFormFieldCell: [CUTEFormImagePickerCell class], FXFormFieldType:FXFormFieldTypeImage},
             @{FXFormFieldKey: @"landlordType", FXFormFieldTitle:STR(@"PropertyInfo/房东类型"),FXFormFieldOptions: _allLandlordTypes, FXFormFieldDefaultValue: [self defaultLandloardType], FXFormFieldAction: @"editLandlordType", FXFormFieldHeader: STR(@"PropertyInfo/基本信息")},
             @{FXFormFieldKey: @"rentPrice", FXFormFieldTitle:STR(@"PropertyInfo/租金"), FXFormFieldAction: @"editRentPrice"},
             @{FXFormFieldKey: @"rentPeriod", FXFormFieldTitle:STR(@"PropertyInfo/租期"), FXFormFieldAction: @"editRentPeriod"},
                @{FXFormFieldKey: @"propertyType", FXFormFieldTitle:STR(@"PropertyInfo/房产类型"),FXFormFieldOptions: _allPropertyTypes, FXFormFieldDefaultValue: [self defaultPropertyType], FXFormFieldAction: @"editPropertyType"},
             @{FXFormFieldKey: @"rooms", FXFormFieldTitle:STR(@"PropertyInfo/房屋户型（可选Studio）"), FXFormFieldCell: [CUTEFormRoomsPickerCell class], @"style": @(UITableViewCellStyleValue1), FXFormFieldAction: @"editRooms:"},
             @{FXFormFieldKey: @"rentType", FXFormFieldTitle:STR(@"PropertyInfo/出租类型"), FXFormFieldAction: @"editRentType"},
             @{FXFormFieldKey: @"rentAddress", FXFormFieldTitle:STR(@"PropertyInfo/房产地址"), FXFormFieldAction: @"editAddress"},
             @{FXFormFieldKey: @"surrounding", FXFormFieldTitle:STR(@"PropertyInfo/周边"), FXFormFieldAction: @"editSurrounding"},//TODO 显示默认通过地址搜索的的周边建筑物
             @{FXFormFieldKey: @"moreInfo", FXFormFieldTitle:STR(@"PropertyInfo/更多详情和配套设施描述（选填）"), FXFormFieldAction: @"editMoreInfo"},
             @{FXFormFieldKey: @"submit", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:STR(@"PropertyInfo/预览并发布"), FXFormFieldHeader: @"", FXFormFieldAction: @"submit"},
             ];
}

- (void)setAllLandlordTypes:(NSArray *)allLandlordTypes {
    _allLandlordTypes = allLandlordTypes;
}

- (CUTEEnum *)defaultLandloardType {
    if (_landlordType) {
        return _landlordType;
    }
    return [CUTEPropertyInfoForm getDefaultLandloardType:_allLandlordTypes];
}

- (CUTEEnum *)defaultPropertyType {
    if (_propertyType) {
        return _propertyType;
    }

    return [CUTEPropertyInfoForm getDefaultPropertyType:_allPropertyTypes];
}

- (void)setAllPropertyTypes:(NSArray *)allPropertyTypes {
    _allPropertyTypes = [allPropertyTypes select:^BOOL(CUTEEnum *object) {
        return [@[@"student_housing", @"house", @"apartment"] containsObject:object.slug];
    }];
}

- (NSArray *)allPropertyTypeValues {
    return [_allPropertyTypes map:^id(CUTEEnum *object) {
        return [object value];
    }];
}

+ (CUTEEnum *)getDefaultLandloardType:(NSArray *)types {
    CUTEEnum *liveoutLandlord = [types find:^BOOL(CUTEEnum *object) {
        return object.slug && [object.slug isEqualToString:@"live_out_landlord"];
    }];
    if (liveoutLandlord) {
        return liveoutLandlord;
    }
    return [types firstObject];
}

+ (CUTEEnum *)getDefaultPropertyType:(NSArray *)types {

    CUTEEnum *apartment = [types find:^BOOL(CUTEEnum *object) {
        return object.slug && [object.slug isEqualToString:@"apartment"];
    }];

    if (apartment) {
        return apartment;
    }
    return [types firstObject];
}

@end
