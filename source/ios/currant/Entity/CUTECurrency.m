//
//  CUTECurrency.m
//  currant
//
//  Created by Foster Yin on 4/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTECurrency.h"
#import "CUTECommonMacro.h"
#import <MTLValueTransformer.h>

@implementation CUTECurrency

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

+ (CUTECurrency *)currencyWithValue:(NSString *)value unit:(NSString *)unit {
    CUTECurrency *currency = [CUTECurrency new];
    currency.unit = unit;
    currency.value = value;
    return currency;
}

- (BOOL)isEqual:(id)object {
    if ([object isKindOfClass:[self class]]) {
        //self.value
        NSNumberFormatter *formatter = [NSNumberFormatter new];
        formatter.numberStyle = NSNumberFormatterDecimalStyle;
        NSNumber *aValue = self.value? [formatter numberFromString:self.value]: nil;
        NSNumber *bVlaue = [(CUTECurrency *)object value]? [formatter numberFromString:[(CUTECurrency *)object value]]: nil;
        return [self.unit isEqualToString:[object unit]] && [aValue isEqualToNumber: bVlaue];
    }
    else {
        return NO;
    }
}

- (NSUInteger)hash {
    if (self.unit && self.value) {
        return self.unit.hash ^ self.value.hash;
    }
    return [super hash];
}

- (NSDictionary *)toParams {
    return @{
      @"unit":self.unit,
      @"value":self.value?: @""
      };
}

- (NSString *)symbol {
    return [CUTECurrency symbolOfCurrencyUnit:self.unit];
}

+ (NSString *)symbolOfCurrencyUnit:(NSString *)currency {
    return @{@"CNY":@"￥",
             @"GBP":@"£",
             @"USD":@"$",
             @"EUR":@"€",
             @"HKD":@"$"
             }[currency];
}

+ (NSArray *)currencyUnitArray {
    return @[@"CNY", @"GBP", @"USD", @"EUR", @"HKD"];
}

+ (NSString *)defaultCurrencyUnit {
    return @"GBP";
}

@end
