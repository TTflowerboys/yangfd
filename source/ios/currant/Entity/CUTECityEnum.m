
//
//  CUTECityEnum.m
//  currant
//
//  Created by Foster Yin on 4/6/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTECityEnum.h"

@implementation CUTECityEnum

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"slug": @"slug",
             @"status": @"status",
             @"type": @"type",
             @"time": @"time",
             @"value": @"value",
             @"country": @"country"};
}

+ (NSValueTransformer *)countryJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTEEnum class]];
}

+ (CUTECityEnum *)cityWithValue:(NSString *)value {
    CUTECityEnum *city = [CUTECityEnum new];
    city.value = value;
    return city;
}

@end
