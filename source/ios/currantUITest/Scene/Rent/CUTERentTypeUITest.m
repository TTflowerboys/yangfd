//
//  CUTERentTypeUITest.m
//  currant
//
//  Created by Foster Yin on 7/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import <KIF.h>
#import <KIF/KIFUITestActor-ConditionalTests.h>
#import "KIFUITestActor+Login.h"
#import "CUTECommonMacro.h"
#import "KIFUITestActor+RentType.h"


SpecBegin(RentTypeUI)

describe(@"RentType", ^ {

    beforeAll(^{
        [tester logout];
        [tester login];
        [tester waitForTimeInterval:5];//ticket or rent-type load
    });

    it(@"should select whole ok", ^{
        [tester selectRentTypeWhole];
        [tester waitForAnimationsToFinish];
    });

    it(@"should select single ok", ^{
        [tester selectRentTypeSingle];
        [tester waitForAnimationsToFinish];
    });
});

SpecEnd
