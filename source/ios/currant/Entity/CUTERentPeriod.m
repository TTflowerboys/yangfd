//
//  CUTERentPeriod.m
//  currant
//
//  Created by Foster Yin on 4/20/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPeriod.h"
#import "CUTECommonMacro.h"

@implementation CUTERentPeriod

+(CUTERentPeriod *)negotiableRentPeriod {
    CUTERentPeriod *rentPeriod = [CUTERentPeriod new];
    //no id, only value
    rentPeriod.value = STR(@"面议");
    return rentPeriod;
}

- (BOOL)isEqual:(CUTERentPeriod *)object {
    if ([object isKindOfClass:[self class]]) {
        return [self.value isEqualToString:[object value]];
    }
    else {
        return false;
    }
}


@end
