//
//  NSArray+CUTECDN.m
//  currant
//
//  Created by Foster Yin on 6/13/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "NSArray+CUTECDN.h"
#import "NSArray+ObjectiveSugar.h"
#import "NSString+NGRValidator.h"
#import "NSString+CUTECDN.h"

@implementation NSArray (CUTECDN)

- (BOOL)containsCDNPath:(NSString *)anObject {
    return [self detect:^BOOL(NSString *object) {
        return [object isCDNPathEqualToCDNPath:anObject];
    }] != nil;
}

- (NSUInteger)indexOfCDNPath:(id)anObject {
    NSString *object = [self detect:^BOOL(NSString *object) {
        return [object isCDNPathEqualToCDNPath:anObject];
    }];
    return [self indexOfObject:object];
}

@end
