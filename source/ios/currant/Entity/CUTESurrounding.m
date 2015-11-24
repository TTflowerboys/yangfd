//
//  CUTESurrounding.m
//  currant
//
//  Created by Foster Yin on 11/10/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import "CUTESurrounding.h"
#import <NSArray+ObjectiveSugar.h>
#import <EXTKeyPathCoding.h>
#import "CUTECommonMacro.h"
#import "MTLValueTransformer+NumberString.h"

@implementation CUTESurrounding


+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"name": @"name",
             @"zipcode": @"zipcode",
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

+ (NSValueTransformer *)latitudeJSONTransformer {
    return [MTLValueTransformer numberStringTransformer];
}

+ (NSValueTransformer *)longitudeJSONTransformer {
    return [MTLValueTransformer numberStringTransformer];
}

- (NSString *)address {
    if (!IsNilNullOrEmpty(self.zipcode)) {
        return self.zipcode;
    }
    else
    if (self.latitude.stringValue && self.longitude.stringValue) {
        return [@[self.latitude.stringValue, self.longitude.stringValue] componentsJoinedByString:@","];
    }
    return nil;
}

#pragma -mark CUTEModelEditingListenerDelegate

- (id)paramValueForKey:(NSString *)key withValue:(id)value {
    if ([key isEqualToString:@keypath(self.name)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.zipcode)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.latitude)]) {
        if ([value isKindOfClass:[NSNumber class]]) {
            return value;
        }
        else if ([value isKindOfClass:[NSString class]]) {
            return [NSNumber numberWithDouble:[(NSString *)value doubleValue]];
        }
        return value;
    }
    else if ([key isEqualToString:@keypath(self.longitude)]) {
        if ([value isKindOfClass:[NSNumber class]]) {
            return value;
        }
        else if ([value isKindOfClass:[NSString class]]) {
            return [NSNumber numberWithDouble:[(NSString *)value doubleValue]];
        }
    }
    else if ([key isEqualToString:@keypath(self.type)] && [value isKindOfClass:[CUTEEnum class]]) {
        return [(CUTEEnum *)value identifier];
    }
    else if ([key isEqualToString:@keypath(self.trafficTimes)] && [value isKindOfClass:[NSArray class]]) {
        NSObject* result = [(NSArray *)value map:^id(CUTETrafficTime *object) {
            return [object toParams];
        }];
        return result;
    }

    NSAssert(nil, @"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,key);
    return nil;
}

- (BOOL)isAttributeEqualForKey:(NSString *)key oldValue:(id)oldValue newValue:(id)newValue {
    return [oldValue isEqual:newValue];
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
