//
//  CUTEAddressUtilTest.m
//  currant
//
//  Created by Foster Yin on 6/22/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import "CUTEAddressUtil.h"


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



SpecBegin(AddressUtil)

describe(@"buildAddress", ^ {

    it(@"should return empty when no parts", ^ {
        NSString *address = [CUTEAddressUtil buildAddress:nil];
        assertThat(address, equalTo(@""));
    });

    it(@"should have no end comma when only have one part", ^ {
        NSString *address = [CUTEAddressUtil buildAddress:@[@"great street"]];
        assertThatBool([address hasSuffix:@", "], isFalse());
    });

    it(@"should have commas when have multiple parts", ^ {
        NSString *address = [CUTEAddressUtil buildAddress:@[@"great street", @"wuhan city"]];
        assertThatInt([address occurrenceCountOfCharacter:','], equalToInt(1));
        assertThatBool([address hasSuffix:@", "], isFalse());
    });

});

SpecEnd
