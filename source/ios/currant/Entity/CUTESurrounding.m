//
//  CUTESurrounding.m
//  currant
//
//  Created by Foster Yin on 11/10/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import "CUTESurrounding.h"
#import <NSArray+ObjectiveSugar.h>

@implementation CUTESurrounding


+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"name": @"name",
             @"zipcode": @"zipcode",
             @"postcode": @"postcode",
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
