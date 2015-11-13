//
//  CUTESurrounding.m
//  currant
//
//  Created by Foster Yin on 11/10/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import "CUTESurrounding.h"
#import <NSArray+ObjectiveSugar.h>
#import "CUTECommonMacro.h"

@implementation CUTESurrounding


+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"name": @"name",
             @"zipcode": @"zipcode",
             @"postcode": @"postcode",
             @"latitude": @"latitude",
             @"longitude": @"longitude",
             @"type": @"type",
             @"trafficTimes": @"traffic_time"
             };
}

+ (NSValueTransformer *)typeJSONTransformer {
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTEEnum class]];
}

+ (NSValueTransformer *)trafficTimesJSONTransformer {
    return [NSValueTransformer mtl_JSONArrayTransformerWithModelClass:[CUTETrafficTime class]];
}

//TODO research on the double string parse
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

- (NSString *)address {
    if (!IsNilNullOrEmpty(self.zipcode)) {
        return self.zipcode;
    }
    else if (!IsNilNullOrEmpty(self.postcode)) {
        return self.postcode;
    }
    else if (self.latitude.stringValue && self.longitude.stringValue) {
        return [@[self.latitude.stringValue, self.longitude.stringValue] componentsJoinedByString:@","];
    }
    return nil;
}

- (NSDictionary *)toParams {
    if (self.identifier == nil) {
        return nil;
    }
    if (self.type == nil) {
        return nil;
    }

    if (self.trafficTimes == nil || self.trafficTimes.count == 0) {
        return nil;
    }

    NSArray *trafficTimesParams = [self.trafficTimes map:^id(CUTETrafficTime *object) {
        return [object toParams];
    }];

    return @{@"id": self.identifier, @"type": self.type.identifier, @"traffic_time": trafficTimesParams};
}

@end
