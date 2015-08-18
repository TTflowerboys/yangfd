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
//        [[CUTEShareManager sharedInstance] shareTicket:ticket];
        [tester waitForViewWithAccessibilityLabel:STR(@"分享")];
        [system waitForApplicationToOpenAnyURLWhileExecutingBlock:^{
            [tester tapViewWithAccessibilityLabel:STR(@"微信好友")];
        } returning:YES];
        [tester waitForTimeInterval:3];

    });

});

describe(@"share text and url", ^{
    it(@"should success", ^{
//        [[CUTEShareManager sharedInstance] shareText:@"share text" urlString:@"http://www.baidu.com" inServices:@[CUTEShareServiceWechatCircle, CUTEShareServiceSinaWeibo]];
        [tester waitForViewWithAccessibilityLabel:STR(@"分享")];
        [system waitForApplicationToOpenAnyURLWhileExecutingBlock:^{
            [tester tapViewWithAccessibilityLabel:STR(@"微信好友")];
        } returning:YES];
        [tester waitForTimeInterval:3];
    });
});

SpecEnd
