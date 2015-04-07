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
#import "CUTECityEnum.h"
#import <NSArray+Frankenstein.h>

@interface CUTERentAddressEditForm () {
    CUTEEnum *_defaultCountry;

    NSArray *_allCountries;

    CUTEEnum *_defaultCity;

    NSArray *_allCities;
}

@end

@implementation CUTERentAddressEditForm

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"street", FXFormFieldTitle: STR(@"街道"), FXFormFieldHeader:STR(@"位置")},
             @{FXFormFieldKey: @"city", FXFormFieldTitle: STR(@"城市"), FXFormFieldOptions: [self cityValuesOfCountry:_defaultCountry], FXFormFieldDefaultValue: _defaultCity? _defaultCity.value: @""},
             @{FXFormFieldKey: @"postCode", FXFormFieldTitle: STR(@"邮政编码")},
             @{FXFormFieldKey: @"country", FXFormFieldTitle: STR(@"国家"), FXFormFieldOptions: [self countryValues], FXFormFieldDefaultValue: _defaultCountry? _defaultCountry.value: @""}
             ];
}

- (void)setDefaultCountry:(CUTEEnum *)country {
    _defaultCountry = country;
}

- (void)setAllCountries:(NSArray *)allCountries {
    _allCountries = allCountries;
}

- (NSArray *)countryValues {
    NSArray *countryValues = [_allCountries map:^id(CUTEEnum *obj) {
        return [obj value];
    }];
    return countryValues;
}

- (void)setDefaultCity:(CUTEEnum *)city {
    _defaultCity = city;
}

- (void)setAllCities:(NSArray *)allCities {
    _allCities = allCities;
}

- (NSArray *)cityValuesOfCountry:(CUTEEnum *)country {
    if (country) {
        return [[_allCities collect:^BOOL(CUTECityEnum *object) {
            return [object.country.identifier isEqualToString:country.identifier] && !IsNilNullOrEmpty(object.value);
        }] map:^id(CUTEEnum *object) {
            return [object value];
        }];
    }
    return nil;
}

@end
