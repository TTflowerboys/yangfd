//
//  MTLValueTransformer+NumberString.m
//  currant
//
//  Created by Foster Yin on 11/19/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import "MTLValueTransformer+NumberString.h"

@implementation MTLValueTransformer (NumberString)

+ (instancetype)numberStringTransformer {
    return [MTLValueTransformer reversibleTransformerWithForwardBlock:^NSNumber *(id value) {
        if ([value isKindOfClass:[NSString class]]) {
            return [NSNumber numberWithDouble:[(NSString *)value doubleValue]];
        }
        return value;

    } reverseBlock:^NSString *(NSNumber *number) {
        return number.stringValue;
    }];
}

@end
