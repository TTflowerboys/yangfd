//
//  CUTEStringMatcher.m
//  currant
//
//  Created by Foster Yin on 7/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEStringMatcher.h"
#import "NSArray+ObjectiveSugar.h"
#import "NSObject+Attachment.h"

@implementation CUTEStringMatcher

#define TMIN(a, b, c) MIN(a, MIN(b, c))

+ (NSInteger)getLevenshteinDistanceFromSource:(NSString *)source withTarget:(NSString *)target {
    if ([source isEqualToString:target]) return 0;
    if (source.length == 0) return target.length;
    if (target.length == 0) return source.length;

    NSMutableArray *v0 = [NSMutableArray arrayWithCapacity:target.length + 1];
    NSMutableArray *v1 = [NSMutableArray arrayWithCapacity:target.length + 1];

    NSUInteger count = v0.count;
    for (int i = 0; i < count; i++)
    {
        [v0 addObject:@(i)];
        [v1 addObject:@(0)];
    }

    NSUInteger sourceCount = source.length;
    for (int i = 0; i < sourceCount; i++)
    {
        [v1 setObject:@(i + 1) atIndexedSubscript:0];

        NSUInteger targetCount = target.length;
        for (int j = 0; j < targetCount; j++)
        {
            NSUInteger cost = [source characterAtIndex:i] == [target characterAtIndex:j]? 0: 1;
            [v1 setObject:@(TMIN([[v1 objectAtIndex:j] integerValue] + 1, [[v0 objectAtIndex:j + 1] integerValue] + 1, [[v0 objectAtIndex:j] integerValue] + cost)) atIndexedSubscript:j + 1];
        }


        for (int j = 0; j < v0.count; j++)
        {
            [v0 setObject:[v1 objectAtIndex:j] atIndexedSubscript:j];
        }
    }

    return [v1[target.length] integerValue];
}

+ (NSArray *)matchElementsWithString:(NSString *)string  sourceElements:(NSArray *)sourceElements attributeSelector:(SEL)selector {

    [sourceElements each:^(NSObject *object) {
        NSString *attrString = [object performSelector:selector];
        NSNumber *score = @([self getLevenshteinDistanceFromSource:string withTarget:attrString]);
        object.attachment = score;
    }];

    return [sourceElements sortedArrayUsingComparator:^NSComparisonResult(NSObject *obj1, NSObject *obj2) {
        return [obj1.attachment compare:obj2.attachment];
    }];
}

@end
