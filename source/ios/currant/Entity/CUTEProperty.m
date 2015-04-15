//
//  CUTEProperty.m
//  currant
//
//  Created by Foster Yin on 4/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEProperty.h"
#import "CUTECommonMacro.h"
#import "CUTEEnum.h"
#import <NSArray+Frankenstein.h>

@implementation CUTEProperty

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    //TODO finish mapping
    return @{@"identifier": @"id",
             @"slug": @"slug",
             @"status": @"status",
             @"type": @"type",
             @"time": @"time",
             @"value": @"value"};
}

- (NSDictionary *)toParams {
    NSMutableDictionary *params =
    [NSMutableDictionary dictionaryWithDictionary:@{@"bedroom_count": @(self.bedroomCount),
                                                    @"zipcode": self.zipcode? self.zipcode: @"",
                                                    }];
    if (self.name && self.name.toParams) {
        [params setValue:self.name.toParams forKey:@"name"];
    }
    if (self.propertyDescription && self.propertyDescription.toParams) {
        [params setValue:self.propertyDescription.toParams forKey:@"description"];
    }
    if (self.street && self.street.toParams) {
        [params setValue:self.street.toParams forKey:@"street"];
    }
    if (self.country && self.country.identifier) {
        [params setValue:self.country.identifier forKey:@"country"];
    }
    if (self.city && self.city.identifier) {
        [params setValue:self.city.identifier forKey:@"city"];
    }
    if (!IsArrayNilOrEmpty(self.indoorFacilities)) {
        [params setValue:[[self.indoorFacilities map:^id(CUTEEnum *object) {
            return object.identifier;
        }] componentsJoinedByString:@","] forKey:@"indoor_facility"];
    }
    if (!IsArrayNilOrEmpty(self.communityFacilities)) {
        [params setValue:[[self.communityFacilities map:^id(CUTEEnum *object) {
            return object.identifier;
        }] componentsJoinedByString:@","] forKey:@"community_facility"];
    }
    if (!IsArrayNilOrEmpty(self.realityImages)) {
        [params setValue:[self.realityImages componentsJoinedByString:@","] forKey:@"reality_images"];
    }
    if (self.location) {
        [params setValue:@(self.location.coordinate.latitude) forKey:@"latitude"];
        [params setValue:@(self.location.coordinate.longitude) forKey:@"longitude"];
    }
    return params;
}

- (NSString *)address {
    return [@[NilNullToEmpty(self.street.value),
              NilNullToEmpty(self.zipcode),
              NilNullToEmpty(self.city.value),
              NilNullToEmpty(self.country.value)]
            componentsJoinedByString:@" "];
}

@end
