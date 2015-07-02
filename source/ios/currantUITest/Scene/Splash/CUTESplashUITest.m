//
//  CUTESplashUITest.m
//  currant
//
//  Created by Foster Yin on 6/30/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import <KIF.h>
#import "KIFUITestActor+Login.h"
#import "CUTECommonMacro.h"
#import "Base64.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "KIFUITestActor+SplashUI.h"


SpecBegin(SplashUI)

describe(@"Swipe", ^{
    
    before(^{
        [tester logout];
    });

    it(@"should work ok", ^{
        [tester swipeToSplashEnd];
    });
});


SpecEnd