//
//  CUTEPropertyFacilityForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPropertyFacilityForm.h"
#import "CUTECommonMacro.h"
#import "CUTEEnum.h"
#import <NSObject+Attachment.h>
#import <NSArray+ObjectiveSugar.h>
#import "CUTEFormSwitchCell.h"

@interface CUTEPropertyFacilityForm ()
{
    NSArray *_allIndoorFacilities;

    NSArray *_selectedIndoorFacilities;

    NSArray *_allCommunityFacilities;

    NSArray *_selectedCommunityFacilities;
}

@end

@implementation CUTEPropertyFacilityForm


- (instancetype)init
{
    self = [super init];
    if (self) {

    }
    return self;
}


- (NSArray *)fields {
    NSMutableArray *array = [NSMutableArray array];
    if (!IsArrayNilOrEmpty(_allIndoorFacilities)) {
        NSUInteger count = _allIndoorFacilities.count;
        for (NSUInteger i = 0; i < count; i++)
        {
            CUTEEnum *facility = [_allIndoorFacilities objectAtIndex:i];
            if (i == 0) {
                [array addObject:@{FXFormFieldKey:facility.identifier, FXFormFieldTitle:facility.value,FXFormFieldHeader: STR(@"常用设施"), FXFormFieldType: FXFormFieldTypeBoolean, FXFormFieldDefaultValue: @([_selectedIndoorFacilities containsObject:facility]), FXFormFieldAction: @"switchChanged:", FXFormFieldCell: [CUTEFormSwitchCell class]}];
            }
            else {
              [array addObject:@{FXFormFieldKey:facility.identifier, FXFormFieldTitle:facility.value, FXFormFieldType: FXFormFieldTypeBoolean, FXFormFieldDefaultValue: @([_selectedIndoorFacilities containsObject:facility]), FXFormFieldAction: @"switchChanged:" , FXFormFieldCell: [CUTEFormSwitchCell class]}];
            }
        }
    }
    if (!IsArrayNilOrEmpty(_allCommunityFacilities)) {
        NSUInteger count = _allCommunityFacilities.count;
        for (NSUInteger i = 0; i < count; i++)
        {
            CUTEEnum *facility = [_allCommunityFacilities objectAtIndex:i];
            if (i == 0) {
                [array addObject:@{FXFormFieldKey:facility.identifier, FXFormFieldTitle:facility.value,FXFormFieldHeader: STR(@"小区设施"), FXFormFieldType: FXFormFieldTypeBoolean, FXFormFieldDefaultValue: @([_selectedCommunityFacilities containsObject:facility]), FXFormFieldAction: @"switchChanged:", FXFormFieldCell: [CUTEFormSwitchCell class]}];
            }
            else {
                [array addObject:@{FXFormFieldKey:facility.identifier, FXFormFieldTitle:facility.value, FXFormFieldType: FXFormFieldTypeBoolean, FXFormFieldDefaultValue: @([_selectedCommunityFacilities containsObject:facility]), FXFormFieldAction: @"switchChanged:", FXFormFieldCell: [CUTEFormSwitchCell class]}];
            }
        }
    }
    return array;
}

- (void)setAllIndoorFacilities:(NSArray *)indoorFacilities {
    _allIndoorFacilities = indoorFacilities;
}

- (void)setSelectedIndoorFacilities:(NSArray *)selectedIndoorFacilities {
    _selectedIndoorFacilities = selectedIndoorFacilities;
}

- (CUTEEnum *)getIndoorFacilityByKey:(NSString *)key {
    return [[_allIndoorFacilities select:^BOOL(CUTEEnum *object) {
        return [object.identifier isEqualToString:key];
    }] firstObject];
}

- (void)setAllCommunityFacilities:(NSArray *)communityFacilities {
    _allCommunityFacilities = communityFacilities;
}

- (void)setSelectedCommunityFacilities:(NSArray *)selectedCommunityFacilities {
    _selectedCommunityFacilities = selectedCommunityFacilities;
}

- (CUTEEnum *)getCommunityFacilityByKey:(NSString *)key {
    return [[_allCommunityFacilities select:^BOOL(CUTEEnum *object) {
        return [object.identifier isEqualToString:key];
    }] firstObject];
}

@end
