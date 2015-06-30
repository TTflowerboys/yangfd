//
//  CUTESplashUITest.m
//  currant
//
//  Created by Foster Yin on 6/30/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import <KIF.h>
#import "KIFTestActor+Login.h"
#import "CUTECommonMacro.h"
#import "Base64.h"
#import "SVProgressHUD+CUTEAPI.h"

@interface KIFUITestActor (SplashUI)

- (void)swipeToSplashEnd;

@end

@implementation KIFUITestActor (SplashUI)

- (void)swipeToSplashEnd {
    [tester swipeViewWithAccessibilityLabel:STR(@"引导页面") inDirection:KIFSwipeDirectionLeft];
    [tester waitForAnimationsToFinish];
    [tester swipeViewWithAccessibilityLabel:STR(@"引导页面") inDirection:KIFSwipeDirectionLeft];
    [tester waitForAnimationsToFinish];
}

@end


SpecBegin(SplashUI)

describe(@"Apply beta", ^ {

    before(^{
        [tester logout];
    });

    it(@"should apply success with done button", ^ {
        [tester swipeToSplashEnd];
        [tester tapViewWithAccessibilityLabel:STR(@"申请内测，获取邀请码")];
        [tester waitForAnimationsToFinish];

        NSString *emailId = [[RANDOM_UUID base64EncodedString] substringToIndex:10];
        [tester enterText:CONCAT(emailId, @"@gmail.com") intoViewWithAccessibilityLabel:STR(@"邮箱")];
        [tester tapViewWithAccessibilityLabel:STR(@"确认")];

        [[tester usingTimeout:20] waitForViewWithAccessibilityLabel:STR(@"申请成功")];
        [tester tapViewWithAccessibilityLabel:STR(@"OK")];
    });

    it(@"should apply success with apply button", ^ {
        [tester swipeToSplashEnd];
        [tester tapViewWithAccessibilityLabel:STR(@"申请内测，获取邀请码")];
        [tester waitForAnimationsToFinish];

        NSString *emailId = [[RANDOM_UUID base64EncodedString] substringToIndex:10];
        [tester enterText:CONCAT(emailId, @"@gmail.com") intoViewWithAccessibilityLabel:STR(@"邮箱")];

        [tester tapViewWithAccessibilityLabel:STR(@"申请")];

        [[tester usingTimeout:20] waitForViewWithAccessibilityLabel:STR(@"申请成功")];
        [tester tapViewWithAccessibilityLabel:STR(@"OK")];
        
    });

    after(^{
        //requst so long, dismiss progress, may cause animation test conflict
        [SVProgressHUD dismiss];
        //test failed need mannually dismiss
        if ([tester tryFindingTappableViewWithAccessibilityLabel:STR(@"返回") error:nil]) {
            [tester tapViewWithAccessibilityLabel:STR(@"返回")];
        }
        [tester waitForAnimationsToFinish];
    });
});

SpecEnd