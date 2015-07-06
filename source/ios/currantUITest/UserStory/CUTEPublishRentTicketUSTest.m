//
//  CUTEPublishRentTicketStoryTest.m
//  currant
//
//  Created by Foster Yin on 7/3/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import <KIF.h>
#import "CUTECommonMacro.h"
#import "KIFUITestActor+Login.h"
#import "KIFUITestActor+RentType.h"
#import "KIFUITestActor+SplashUI.h"
#import "KIFUITestActor+AddressMap.h"
#import "KIFUITestActor+PropertyInfo.h"


SpecBegin(PublishRentTiecktUS)

describe(@"PublishRentTicket", ^ {

    it(@"should publish success", ^ {
        [tester login];
        [tester selectRentTypeWhole];
        [tester setPropertyLocationWithCurrentLocation];
        [tester tapViewWithAccessibilityLabel:STR(@"继续")];
        [tester setBedroomCount];
        [tester tapViewWithAccessibilityLabel:STR(@"预览")];
        [tester waitForAnimationsToFinish];
        [tester tapViewWithAccessibilityLabel:STR(@"继续")];
        [tester waitForAnimationsToFinish];
        [tester tapViewWithAccessibilityLabel:STR(@"发布")];
        [tester waitForAnimationsToFinish];
    });
    
});

SpecEnd


