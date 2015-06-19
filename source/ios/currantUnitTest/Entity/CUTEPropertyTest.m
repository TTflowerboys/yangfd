//
//  CUTEPropertyTest.m
//  currant
//
//  Created by Foster Yin on 6/19/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import "CUTEProperty.h"
#import "NSArray+ObjectiveSugar.h"



SpecBegin(Property)

describe(@"keypath", ^ {

    //because change listener use this mapping
    it(@"all keys in json mapping", ^ {
        NSSet *keys = [CUTEProperty propertyKeys];
        NSDictionary *jsonMapping = [CUTEProperty JSONKeyPathsByPropertyKey];
        assertThat(@([jsonMapping.allKeys symmetricDifference:keys.allObjects].count), equalToInt(0));
    });
});

SpecEnd