//
//  CUTEAddressUtilTest.m
//  currant
//
//  Created by Foster Yin on 6/22/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import "CUTEAddressUtil.h"
#import "NSString+OccurrenceCount.h"



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
