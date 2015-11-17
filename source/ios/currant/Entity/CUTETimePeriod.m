//
//  CUTETimePeriod.m
//  currant
//
//  Created by Foster Yin on 6/3/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETimePeriod.h"
#import "CUTECommonMacro.h"

@implementation CUTETimePeriod

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"unit": @"unit",
             @"value": @"value"};
}

+ (CUTETimePeriod *)timePeriodWithValue:(int)value unit:(NSString *)unit {
    CUTETimePeriod *period = [CUTETimePeriod new];
    period.unit = unit;
    period.value = value;
    return period;
}

+ (NSString *)getDisplayUnitWithUnit:(NSString *)unit
{
    return @{@"second": STR(@"TimePeriod/秒"), @"minute": STR(@"TimePeriod/分"), @"hour": STR(@"TimePeriod/小时"),  @"day": STR(@"TimePeriod/天"), @"week": STR(@"TimePeriod/周"), @"month": STR(@"TimePeriod/月")}[unit];
}

- (BOOL)isEqual:(id)object {
    if ([object isKindOfClass:[self class]]) {
        return [self.unit isEqualToString:[object unit]] && (self.value == [(CUTETimePeriod *)object value]);
    }
    else {
        return NO;
    }
}

- (NSString *)unitForDisplay {
    return [CUTETimePeriod getDisplayUnitWithUnit:self.unit];
}

- (NSDictionary *)toParams {
    return @{
             @"unit":self.unit,
             @"value":[NSString stringWithFormat:@"%d", (int)self.value]
             };
}

@end
