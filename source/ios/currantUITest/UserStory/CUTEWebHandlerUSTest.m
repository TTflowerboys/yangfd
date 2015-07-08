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
#import "KIFUITestActor+FilePath.h"

@interface AppDelegate (Private)

@property (nonatomic, strong) UITabBarController *tabBarController;

@end


SpecBegin(WebHandlerUS)

describe(@"WebHandler", ^ {

    before(^{
        [tester logout];
        [tester login];
        [tester tapViewWithAccessibilityLabel:STR(@"主页")];
    });

    it(@"should share text and url success", ^ {
        [tester waitForTimeInterval:5];//page load
        AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
        CUTEWebViewController *webViewController = (CUTEWebViewController *)[[[appDelegate.tabBarController viewControllers] firstObject] topViewController];

        NSString *fileName = @"share.js.txt";
        [webViewController.webView stringByEvaluatingJavaScriptFromString:[tester getFileContentWithFileName:fileName]];
        [tester waitForViewWithAccessibilityLabel:STR(@"分享")];

        [system waitForApplicationToOpenAnyURLWhileExecutingBlock:^{
            [tester tapViewWithAccessibilityLabel:STR(@"微信好友")];
        } returning:YES];
        [tester waitForTimeInterval:3];
    });

    it(@"should create rent ticket success", ^{
        [tester waitForTimeInterval:5];//page load
        AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
        CUTEWebViewController *webViewController = (CUTEWebViewController *)[[[appDelegate.tabBarController viewControllers] firstObject] topViewController];

        NSString *fileName = @"createRentTicket.js.txt";
        [webViewController.webView stringByEvaluatingJavaScriptFromString:[tester getFileContentWithFileName:fileName]];
        [tester waitForAnimationsToFinish];
        [tester waitForViewWithAccessibilityLabel:STR(@"出租发布")];
    });

    it(@"should logout success", ^{
        [tester waitForTimeInterval:5];//page load
        AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
        CUTEWebViewController *webViewController = (CUTEWebViewController *)[[[appDelegate.tabBarController viewControllers] firstObject] topViewController];

        NSString *fileName = @"logout.js.txt";
        [webViewController.webView stringByEvaluatingJavaScriptFromString:[tester getFileContentWithFileName:fileName]];
        [tester waitForAnimationsToFinish];
    });

    it(@"should open rent list tab success", ^{
        [tester waitForTimeInterval:5];
        AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
        CUTEWebViewController *webViewController = (CUTEWebViewController *)[[[appDelegate.tabBarController viewControllers] firstObject] topViewController];
        NSString *fileName = @"openRentListTab.js.txt";
        [webViewController.webView stringByEvaluatingJavaScriptFromString:[tester getFileContentWithFileName:fileName]];
        [tester waitForAnimationsToFinish];
        [tester waitForViewWithAccessibilityLabel:STR(@"出租列表-洋房东")];
    });

    it(@"should open property list tab success", ^{
        [tester waitForTimeInterval:5];
        AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
        CUTEWebViewController *webViewController = (CUTEWebViewController *)[[[appDelegate.tabBarController viewControllers] firstObject] topViewController];
        NSString *fileName = @"openPropertyListTab.js.txt";
        [webViewController.webView stringByEvaluatingJavaScriptFromString:[tester getFileContentWithFileName:fileName]];
        [tester waitForAnimationsToFinish];
        [tester waitForViewWithAccessibilityLabel:STR(@"房产列表-洋房东")];
    });
});

SpecEnd
