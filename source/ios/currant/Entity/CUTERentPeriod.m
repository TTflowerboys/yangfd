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
    rentPeriod.type = @"rent_period";
    rentPeriod.value = STR(@"RentPeriod/面议");
    return rentPeriod;
}

- (BOOL)isEqual:(CUTERentPeriod *)object {
    if ([object isKindOfClass:[self class]] && !IsNilNullOrEmpty(self.value)) {
        return [self.value isEqualToString:[object value]];
    }
    else {
        return false;
    }
}

- (NSUInteger)hash {
    if (self.value) {
        return self.value.hash;
    }
    return [super hash];
}


@end
