//
//  CUTECurrency.m
//  currant
//
//  Created by Foster Yin on 4/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTECurrency.h"

@implementation CUTECurrency

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"unit": @"unit",
             @"value": @"value"};
}

+ (CUTECurrency *)currencyWithValue:(float)value unit:(NSString *)unit {
    CUTECurrency *currency = [CUTECurrency new];
    currency.unit = unit;
    currency.value = value;
    return currency;
}

- (NSDictionary *)toParams {
    return @{
             @"unit":self.unit,
             @"value":[NSString stringWithFormat:@"%lf", self.value]
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
