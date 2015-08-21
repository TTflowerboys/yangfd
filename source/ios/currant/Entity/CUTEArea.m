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

+ (CUTEArea *)areaWithValue:(float)value unit :(NSString *)unit {
    CUTEArea *area = [CUTEArea new];
    area.value = value;
    area.unit = unit;
    return area;
}

- (NSString *)unitSymbol {
    return @{@"meter ** 2": @"m²",
             @"foot ** 2": @"sq ft"
             }[self.unit];
}

- (BOOL)isEqual:(id)object {
    if ([object isKindOfClass:[self class]]) {
        return [self.unit isEqualToString:[object unit]] && fequal(self.value, [(CUTEArea *)object value]);
    }
    else {
        return NO;
    }
}

- (NSDictionary *)toParams {
    return @{
             @"unit":self.unit,
             @"value":FloatToString(self.value)
             };
}

@end
