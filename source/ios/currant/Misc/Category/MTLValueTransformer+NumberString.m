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
    return [MTLValueTransformer transformerUsingForwardBlock:^id(id value, BOOL *success, NSError *__autoreleasing *error) {
        if ([value isKindOfClass:[NSString class]]) {
            return [NSNumber numberWithDouble:[(NSString *)value doubleValue]];
        }
        return value;
    } reverseBlock:^id(id value, BOOL *success, NSError *__autoreleasing *error) {
        if ([value isKindOfClass:[NSNumber class]]) {
            return [(NSNumber *)value stringValue];
        }
        return value;
    }];
}

@end
