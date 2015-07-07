//
//  CUTEWebHandlerUSTest.m
//  currant
//
//  Created by Foster Yin on 7/6/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import <KIF.h>
#import "CUTECommonMacro.h"
#import "CUTEWebViewController.h"
#import "KIFUITestActor+Login.h"
#import "AppDelegate.h"


@interface AppDelegate (Private)

@property (nonatomic, strong) UITabBarController *tabBarController;

@end


SpecBegin(WebHandlerUS)

describe(@"WebHandler", ^ {

    beforeAll(^{
        [tester logout];
        [tester login];
        [tester tapViewWithAccessibilityLabel:STR(@"主页")];
    });

    it(@"should share text and url success", ^ {
        [tester waitForTimeInterval:5];//page load
        AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
        CUTEWebViewController *webViewController = (CUTEWebViewController *)[[[appDelegate.tabBarController viewControllers] firstObject] topViewController];

        [webViewController.webView stringByEvaluatingJavaScriptFromString:@"window.bridge.callHandler('share', {'text': 'good text', 'url':'http://www.baidu.com'})"];
        [tester waitForViewWithAccessibilityLabel:STR(@"分享")];
    });
});

SpecEnd
