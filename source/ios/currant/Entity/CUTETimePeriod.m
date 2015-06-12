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

+ (CUTETimePeriod *)timePeriodWithValue:(float)value unit:(NSString *)unit {
    CUTETimePeriod *period = [CUTETimePeriod new];
    period.unit = unit;
    period.value = value;
    return period;
}

+ (NSString *)getDisplayUnitWithUnit:(NSString *)unit
{
    return @{@"day": STR(@"天"), @"week": STR(@"周"), @"month": STR(@"月")}[unit];
}

- (BOOL)isEqual:(id)object {
    if ([object isKindOfClass:[self class]]) {
        return [self.unit isEqualToString:[object unit]] && fequal(self.value, [(CUTETimePeriod *)object value]);
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
