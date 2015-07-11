//
//  CUTELoginUITest.m
//  currant
//
//  Created by Foster Yin on 7/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import <KIF.h>
#import "KIFUITestActor+SplashUI.h"
#import "CUTECommonMacro.h"
#import "KIFUITestActor+Login.h"


SpecBegin(LoginUI)

describe(@"Login", ^ {

    it(@"should success", ^ {
        [tester login];

    });

});

SpecEnd
