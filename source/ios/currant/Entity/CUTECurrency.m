//
//  CUTECurrency.m
//  currant
//
//  Created by Foster Yin on 4/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTECurrency.h"

@implementation CUTECurrency

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

@end
