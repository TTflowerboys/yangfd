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

    NSArray *_allCountries;

    NSArray *_allCities;
}

@end

@implementation CUTERentAddressEditForm

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"street", FXFormFieldTitle: STR(@"街道"), FXFormFieldHeader:STR(@"位置")},
             @{FXFormFieldKey: @"city", FXFormFieldTitle: STR(@"城市"), FXFormFieldOptions: [self citiesOfCountry:_country], FXFormFieldDefaultValue: _city? _city: (CUTEEnum *)[[self citiesOfCountry:_country] firstObject]},
             @{FXFormFieldKey: @"zipcode", FXFormFieldTitle: STR(@"邮政编码")},
             @{FXFormFieldKey: @"country", FXFormFieldTitle: STR(@"国家"), FXFormFieldOptions: _allCountries, FXFormFieldDefaultValue: _country? _country: (CUTEEnum *)[_allCountries firstObject]}
             ];
}

- (void)setAllCountries:(NSArray *)allCountries {
    _allCountries = allCountries;
}

- (void)setAllCities:(NSArray *)allCities {
    _allCities = allCities;
}

- (NSArray *)citiesOfCountry:(CUTEEnum *)country {
    if (country) {
        return [_allCities collect:^BOOL(CUTECityEnum *object) {
            return [object.country.identifier isEqualToString:country.identifier] && !IsNilNullOrEmpty(object.value);
        }];
    }
    return nil;
}

@end
