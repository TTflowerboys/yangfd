//
//  CUTEProperty.m
//  currant
//
//  Created by Foster Yin on 4/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEProperty.h"

@implementation CUTEProperty

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
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
                                                    @"latitude":@(self.latitude),
                                                    @"longitude":@(self.longitude),
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
    return params;
}

@end
