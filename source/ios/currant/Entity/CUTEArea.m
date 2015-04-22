//
//  CUTEArea.m
//  currant
//
//  Created by Foster Yin on 4/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEArea.h"

@implementation CUTEArea

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"unit": @"unit",
             @"value": @"value"};
}

+ (CUTEArea *)areaWithValue:(float)value unit :(NSString *)unit {
    CUTEArea *area = [CUTEArea new];
    area.value = value;
    area.unit = unit;
    return area;
}

- (NSDictionary *)toParams {
    return @{
             @"unit":self.unit,
             @"value":[NSString stringWithFormat:@"%lf", self.value]
             };
}

@end
