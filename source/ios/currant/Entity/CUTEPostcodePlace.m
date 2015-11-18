//
//  CUTEPostcodePlace.m
//  currant
//
//  Created by Foster Yin on 7/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPostcodePlace.h"
#import "CUTENeighborhood.h"
#import "MTLValueTransformer.h"
#import <NSValueTransformer+MTLPredefinedTransformerAdditions.h>

@implementation CUTEPostcodePlace

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"placeName": @"place_name",
             @"postcode": @"postcode",
             @"postcodeIndex": @"postcode_index",
             @"neighborhoods": @"neighborhoods",
             @"latitude": @"latitude",
             @"longitude": @"longitude",
             };
}

+ (NSValueTransformer *)latitudeJSONTransformer {
    return [MTLValueTransformer reversibleTransformerWithForwardBlock:^NSNumber *(id value) {
        if ([value isKindOfClass:[NSString class]]) {
            return [NSNumber numberWithDouble:[(NSString *)value doubleValue]];
        }
        return value;

    } reverseBlock:^NSString *(NSNumber *number) {
        return number.stringValue;
    }];
}

+ (NSValueTransformer *)longitudeJSONTransformer {
    return [MTLValueTransformer reversibleTransformerWithForwardBlock:^NSNumber *(id value) {
        if ([value isKindOfClass:[NSString class]]) {
            return [NSNumber numberWithDouble:[(NSString *)value doubleValue]];
        }
        return value;

    } reverseBlock:^NSString *(NSNumber *number) {
        return number.stringValue;
    }];
}

+ (NSValueTransformer *)neighborhoodsJSONTransformer {
    return [NSValueTransformer mtl_JSONArrayTransformerWithModelClass:[CUTENeighborhood class]];
}

@end
