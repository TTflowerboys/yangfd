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
#import <NSArray+Frankenstein.h>

@interface CUTEPropertyFacilityForm ()
{
    NSArray *_allIndoorFacilities;

    NSArray *_allCommunityFacilities;
}

@end

@implementation CUTEPropertyFacilityForm

- (NSArray *)fields {
    NSMutableArray *array = [NSMutableArray array];
    if (!IsArrayNilOrEmpty(_allIndoorFacilities)) {
        int count = _allIndoorFacilities.count;
        for (int i = 0; i < count; i++)
        {
            CUTEEnum *facility = [_allIndoorFacilities objectAtIndex:i];
            if (i == 0) {
                [array addObject:@{FXFormFieldKey:facility.identifier, FXFormFieldTitle:facility.value,FXFormFieldHeader: STR(@"常用设施"), FXFormFieldType: FXFormFieldTypeBoolean}];
            }
            else {
                [array addObject:@{FXFormFieldKey:facility.identifier, FXFormFieldTitle:facility.value, FXFormFieldType: FXFormFieldTypeBoolean}];
            }
        }
    }
    if (!IsArrayNilOrEmpty(_allCommunityFacilities)) {
        int count = _allCommunityFacilities.count;
        for (int i = 0; i < count; i++)
        {
            CUTEEnum *facility = [_allCommunityFacilities objectAtIndex:i];
            if (i == 0) {
                [array addObject:@{FXFormFieldKey:facility.identifier, FXFormFieldTitle:facility.value,FXFormFieldHeader: STR(@"小区设施"), FXFormFieldType: FXFormFieldTypeBoolean}];
            }
            else {
                [array addObject:@{FXFormFieldKey:facility.identifier, FXFormFieldTitle:facility.value, FXFormFieldType: FXFormFieldTypeBoolean}];
            }
        }
    }
    return array;
}

- (void)setAllIndoorFacilities:(NSArray *)indoorFacilities {
    _allIndoorFacilities = indoorFacilities;
}

- (CUTEEnum *)getIndoorFacilityByKey:(NSString *)key {
    return [[_allIndoorFacilities collect:^BOOL(CUTEEnum *object) {
        return [object.identifier isEqualToString:key];
    }] firstObject];
}

- (void)setAllCommunityFacilities:(NSArray *)communityFacilities {
    _allCommunityFacilities = communityFacilities;
}

- (CUTEEnum *)getCommunityFacilityByKey:(NSString *)key {
    return [[_allCommunityFacilities collect:^BOOL(CUTEEnum *object) {
        return [object.identifier isEqualToString:key];
    }] firstObject];
}

@end
