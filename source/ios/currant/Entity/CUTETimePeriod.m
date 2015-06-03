//
//  CUTETimePeriod.m
//  currant
//
//  Created by Foster Yin on 6/3/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETimePeriod.h"

@implementation CUTETimePeriod

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"unit": @"unit",
             @"value": @"value"};
}

+ (CUTETimePeriod *)timePeriodWithValue:(float)value unit:(NSString *)unit {
    CUTETimePeriod *period = [CUTETimePeriod new];
    period.unit = unit;
    period.value = value;
    return period;
}

- (NSDictionary *)toParams {
    return @{
             @"unit":self.unit,
             @"value":[NSString stringWithFormat:@"%lf", self.value]
             };
}

@end
