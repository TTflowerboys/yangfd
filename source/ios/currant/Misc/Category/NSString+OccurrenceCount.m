//
//  NSString+OccurrenceCount.m
//  currant
//
//  Created by Foster Yin on 6/23/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "NSString+OccurrenceCount.h"

@implementation NSString (OccurrenceCount)

- (NSUInteger)occurrenceCountOfCharacter:(UniChar)character
{
    CFStringRef selfAsCFStr = (__bridge CFStringRef)self;

    CFStringInlineBuffer inlineBuffer;
    CFIndex length = CFStringGetLength(selfAsCFStr);
    CFStringInitInlineBuffer(selfAsCFStr, &inlineBuffer, CFRangeMake(0, length));

    NSUInteger counter = 0;

    for (CFIndex i = 0; i < length; i++) {
        UniChar c = CFStringGetCharacterFromInlineBuffer(&inlineBuffer, i);
        if (c == character) counter += 1;
    }

    return counter;
}

@end
