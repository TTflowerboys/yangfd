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
#import "AppDelegate.h"
#import "CUTEWebViewController.h"
#import "KIFUITestActor+Login.h"

@interface AppDelegate (Private)

@property (nonatomic, strong) UITabBarController *tabBarController;

@end


SpecBegin(ShareUS)

//describe(@"share ticket", ^ {
//    before(^{
////        [tester login];
//
//    });
//
//    it(@"should success", ^ {
//        CUTETicket *ticket = [[[CUTEDataManager sharedInstance] getAllUnfinishedRentTickets] firstObject];
////        [[CUTEShareManager sharedInstance] shareTicket:ticket];
//        [tester waitForViewWithAccessibilityLabel:STR(@"分享")];
//        [system waitForApplicationToOpenAnyURLWhileExecutingBlock:^{
//            [tester tapViewWithAccessibilityLabel:STR(@"微信好友")];
//        } returning:YES];
//        [tester waitForTimeInterval:3];
//
//    });
//
//});

describe(@"share text and url", ^{
    it(@"should success", ^{
        AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
        CUTEWebViewController *webViewController = (CUTEWebViewController *)[[[appDelegate.tabBarController viewControllers] firstObject] topViewController];
        [[CUTEShareManager sharedInstance] shareText:@"Share Test" description:@"" urlString:@"http://www.baidu.com" imageUrl:@"https://devimages.apple.com.edgekey.net/assets/elements/icons/128x128/os-x-10-11-white.png" inServices:@[CUTEShareServiceWechatCircle, CUTEShareServiceSinaWeibo] viewController:webViewController onButtonPressBlock:^(NSString *buttonName) {

        }];

        [tester waitForViewWithAccessibilityLabel:STR(@"分享")];
        [system waitForApplicationToOpenAnyURLWhileExecutingBlock:^{
            [tester tapViewWithAccessibilityLabel:STR(@"微信好友")];
        } returning:YES];
        [tester waitForTimeInterval:3];
    });
});

SpecEnd
