//
//  CUTEArea.m
//  currant
//
//  Created by Foster Yin on 4/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEArea.h"
#import "CUTECommonMacro.h"

@implementation CUTEArea

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"unit": @"unit",
             @"value": @"value"};
}

//Be compatible with old data with value type as NSNumber
+ (NSValueTransformer *)valueJSONTransformer {
    return [MTLValueTransformer reversibleTransformerWithForwardBlock:^NSString *(id value) {
        if ([value isKindOfClass:[NSNumber class]]) {
            return [(NSNumber *)value stringValue];
        }
        else if ([value isKindOfClass:[NSString class]]) {
            return value;
        }
        else {
            return nil;
        }
    } reverseBlock:^NSString *(id value) {
        if ([value isKindOfClass:[NSNumber class]]) {
            return [(NSNumber *)value stringValue];
        }
        else if ([value isKindOfClass:[NSString class]]) {
            return value;
        }
        else {
            return nil;
        }
    }];
}

+ (CUTEArea *)areaWithValue:(NSString *)value unit :(NSString *)unit {
    CUTEArea *area = [CUTEArea new];
    area.value = value;
    area.unit = unit;
    return area;
}

- (NSString *)unitPresentation {
    return @{@"meter ** 2": STR(@"Area/平方米"),
             @"foot ** 2": STR(@"Area/平方英尺")
             }[self.unit];
}

- (BOOL)isEqual:(id)object {
    if ([object isKindOfClass:[self class]]) {
        //self.value
        NSNumberFormatter *formatter = [NSNumberFormatter new];
        formatter.numberStyle = NSNumberFormatterDecimalStyle;
        NSNumber *aValue = self.value? [formatter numberFromString:self.value]: nil;
        NSNumber *bVlaue = [(CUTEArea *)object value]? [formatter numberFromString:[(CUTEArea *)object value]]: nil;
        return [self.unit isEqualToString:[object unit]] && [aValue isEqualToNumber: bVlaue];
    }
    else {
        return NO;
    }
}

- (NSDictionary *)toParams {
    if (!IsNilNullOrEmpty(self.value)) {
        return @{
                 @"unit":self.unit,
                 @"value":self.value
                 };
    }
    return nil;
}

@end
