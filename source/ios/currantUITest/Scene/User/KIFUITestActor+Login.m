//
//  KIFUITestActor+Login.m
//  currant
//
//  Created by Foster Yin on 7/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "KIFUITestActor+Login.h"
#import "KIFUITestActor+SplashUI.h"
#import "CUTECommonMacro.h"
#import "CUTEDataManager.h"
#import "CUTENotificationKey.h"
#import "KIFTestActor+OHHttpStubs.h"


@implementation KIFUITestActor (Login)

- (void)login {

//    [tester setStubEnabled:YES];
//    [tester registerRequestURLPath:@"/api/1/user/login" toResponseFileAtPath:@"login.json"];

    [self logout];
    [self swipeToSplashEnd];
    [self tapViewWithAccessibilityLabel:STR(@"有邀请码？进入应用")];
    [self waitForAnimationsToFinish];
    [self tapRowAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:0] inTableViewWithAccessibilityIdentifier:STR(@"用户信息")];
    [self waitForAnimationsToFinish];
    [self tapRowAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:0] inTableViewWithAccessibilityIdentifier:STR(@"Form")];
    [self waitForAnimationsToFinish];
    [self tapRowAtIndexPath:[NSIndexPath indexPathForRow:1 inSection:0] inTableViewWithAccessibilityIdentifier:@"Form"];
    [self waitForAnimationsToFinish];
    [self enterText:@"15872411146" intoViewWithAccessibilityLabel:STR(@"手机号")];
    [self waitForAnimationsToFinish];
    [self enterText:@"abc123" intoViewWithAccessibilityLabel:STR(@"密码")];
    [self tapRowAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:1] inTableViewWithAccessibilityIdentifier:@"Form"];
//    [self waitForViewWithAccessibilityLabel:STR(@"登录中...")];
    [[self usingTimeout:20] waitForAbsenceOfViewWithAccessibilityLabel:STR(@"登录中...")];
    [self waitForAnimationsToFinish];


    //set cookie mannually
//    NSHTTPCookie *cookie = [NSHTTPCookie cookieWithProperties:@{@"name":@"currant_auth", @"value": @"\"!ritVWhLagvVWED5zsNKyzg==?gAJVDGN1cnJhbnRfYXV0aHEBfXECKFUFbG9naW5xA4hVAmlkcQRVGDU0MDNlZGU0ZTc0ZmQ1Njk3YWY3ODNlMHEFdYZxBi4=\"", @"domain": @"currant-dev.bbtechgroup.com", @"path": @"/"}];
//    [[NSHTTPCookieStorage sharedHTTPCookieStorage] setCookie:cookie];

}

- (void)logout {
    [[CUTEDataManager sharedInstance] clearAllCookies];
    [[CUTEDataManager sharedInstance] clearUser];
    [NotificationCenter postNotificationName:KNOTIF_USER_DID_LOGOUT object:nil];
}

@end
