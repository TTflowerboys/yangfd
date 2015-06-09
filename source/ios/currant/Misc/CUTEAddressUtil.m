//
//  CUTEAddressUtil.m
//  currant
//
//  Created by Foster Yin on 6/9/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEAddressUtil.h"
#import "NSArray+ObjectiveSugar.h"
#import "CUTECommonMacro.h"

@implementation CUTEAddressUtil

+ (NSString *)buildAddress:(NSArray *)parts {
    NSMutableString *ret = [NSMutableString string];

    [parts each:^(NSString *object) {
        if (!IsNilOrNull(object) && [object isKindOfClass:[NSString class]] && object.length) {
            [ret appendFormat:@"%@, ", object];
        }
    }];

    if ([ret hasSuffix:@", "]) {
        [ret deleteCharactersInRange:NSMakeRange(ret.length - 2, 2)];
    }

    return ret;
}

@end
