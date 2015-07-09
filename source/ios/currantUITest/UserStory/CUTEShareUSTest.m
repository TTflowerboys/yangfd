//
//  CUTEShareUSTest.m
//  currant
//
//  Created by Foster Yin on 7/9/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import <KIF.h>
#import "CUTECommonMacro.h"
#import "CUTEShareManager.h"
#import "CUTEDataManager.h"
#import "KIFUITestActor+Login.h"


SpecBegin(ShareUS)

describe(@"share ticket", ^ {
    before(^{
        [tester login];
    });

    it(@"should success", ^ {
        CUTETicket *ticket = [[[CUTEDataManager sharedInstance] getAllUnfinishedRentTickets] firstObject];
        if(ticket) {

        }
        [[CUTEShareManager sharedInstance] shareTicket:ticket];
        [tester waitForViewWithAccessibilityLabel:STR(@"分享")];
        
    });
    
});

describe(@"share text and url", ^{
    it(@"should success", ^{

    });
});

SpecEnd
