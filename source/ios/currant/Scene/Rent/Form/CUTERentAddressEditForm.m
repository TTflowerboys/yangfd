//
//  CUTERentAddressEditForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentAddressEditForm.h"
#import "CUTECommonMacro.h"
#import "CUTEEnum.h"
#import <NSArray+ObjectiveSugar.h>
#import "CUTEFormFixNonBreakingSpaceTextFieldCell.h"
#import "CUTEFormDefaultCell.h"
#import "CUTECity.h"


@interface CUTERentAddressEditForm () {

    NSArray *_allCountries;

    NSArray *_allCities;
}

@end

@implementation CUTERentAddressEditForm

- (NSArray *)fields {
    NSMutableArray *array = [NSMutableArray
                             arrayWithArray:@[
                                              @{FXFormFieldKey: @"postcode", FXFormFieldTitle: STR(@"Postcode"), FXFormFieldDefaultValue: _postcode? _postcode: @"", FXFormFieldCell: [CUTEFormFixNonBreakingSpaceTextFieldCell class], FXFormFieldAction: @"onPostcodeEdit:"},
                                              @{FXFormFieldKey: @"street", FXFormFieldTitle: STR(@"街道（选填）"), FXFormFieldDefaultValue: _street? _street: @"", FXFormFieldCell: [CUTEFormFixNonBreakingSpaceTextFieldCell class], FXFormFieldAction: @"onStreetEdit:"},
                                              @{FXFormFieldKey: @"community", FXFormFieldTitle: STR(@"小区（选填）"), FXFormFieldDefaultValue: _community? _community: @"", FXFormFieldCell: [CUTEFormFixNonBreakingSpaceTextFieldCell class], FXFormFieldAction: @"onCommunityEdit:"},
                                              @{FXFormFieldKey: @"floor", FXFormFieldTitle: STR(@"楼层（选填）"), FXFormFieldDefaultValue: _floor? _floor: @"", FXFormFieldCell: [CUTEFormFixNonBreakingSpaceTextFieldCell class], FXFormFieldAction: @"onFloorEdit:"},
                                              @{FXFormFieldKey: @"houseName", FXFormFieldTitle: STR(@"门牌号（选填）"), FXFormFieldDefaultValue: _houseName? _houseName: @"", FXFormFieldCell: [CUTEFormFixNonBreakingSpaceTextFieldCell class], FXFormFieldAction: @"onHouseNameEdit:"},
                                              ]];
    if (_country) {
        [array insertObject:@{FXFormFieldKey: @"country", FXFormFieldTitle: STR(@"国家"), FXFormFieldOptions: _allCountries, FXFormFieldDefaultValue: _country, FXFormFieldAction: @"optionBack", FXFormFieldHeader:STR(@"位置")} atIndex:0];
    }
    else {
        [array insertObject:@{FXFormFieldKey: @"country", FXFormFieldTitle: STR(@"国家"), FXFormFieldOptions: _allCountries, FXFormFieldAction: @"optionBack", FXFormFieldHeader:STR(@"位置"), FXFormFieldHeader:STR(@"位置")} atIndex:0];
    }
    if (_city) {
        [array insertObject:@{FXFormFieldKey: @"city", FXFormFieldTitle: STR(@"城市"), FXFormFieldOptions: _allCities, FXFormFieldDefaultValue: _city, FXFormFieldAction: @"optionBack"} atIndex:1];
    }
    else {
        if (!IsArrayNilOrEmpty(_allCities)) {
             [array insertObject:@{FXFormFieldKey: @"city", FXFormFieldTitle: STR(@"城市"), FXFormFieldOptions:_allCities, FXFormFieldAction: @"optionBack"} atIndex:1];
        }
    }

    return array;
}

- (void)setAllCountries:(NSArray *)allCountries {
    _allCountries = allCountries;
}

- (void)setAllCities:(NSArray *)allCities {
    _allCities = allCities;
}

- (NSError *)validateFormWithScenario:(NSString *)scenario {
    NSError *error = nil;
    [NGRValidator validateModel:self error:&error delegate:nil rules:^NSArray *{
        return @[NGRValidate(@"city").required(),
                 NGRValidate(@"postcode").required(),
                 NGRValidate(@"country").required()
                 ];
    }];
    return error;
}

@end
