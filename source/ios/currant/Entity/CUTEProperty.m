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
    return @{@"bedroom_count": @(self.bedroomCount),
             @"city": self.city? self.city.identifier: @"",
             @"country": self.country? self.country.identifier: @"",
             @"latitude":@(self.latitude),
             @"longitude":@(self.longitude),
             @"name":self.name? self.name: @"",
             @"description":self.propertyDescription? self.propertyDescription: @"",
             @"street": self.street? self.street: @"",
             @"zipcode": self.zipcode? self.zipcode: @"",
             };
}

@end
