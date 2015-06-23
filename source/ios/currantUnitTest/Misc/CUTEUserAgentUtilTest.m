//
//  CUTEUserAgentUtilTest.m
//  currant
//
//  Created by Foster Yin on 6/23/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import "CUTEUserAgentUtil.h"
#import <UIKit/UIKit.h>

SpecBegin(UserAgentUtil)

describe(@"setupUserAgent", ^ {

    it(@"should setup ok", ^ {
        NSString *userAgent = [[NSUserDefaults standardUserDefaults] stringForKey:@"UserAgent"];
        assertThat(userAgent, notNilValue());
    });

    it(@"should have currant", ^ {
        NSString *userAgent = [[NSUserDefaults standardUserDefaults] stringForKey:@"UserAgent"];
        assertThat(userAgent, containsString(@"currant"));
    });

//    it(@"request should have correct user agent", ^{
//
//        NSURLRequest *request = [NSURLRequest requestWithURL:[NSURL URLWithString:@"http://www.baidu.com"]];
//        NSDictionary *headers = request.allHTTPHeaderFields;
//        NSString *userAgent = [headers objectForKey:@"UserAgent"];
//        assertThat(userAgent, containsString(@"currant"));
//    });

    it(@"webview should have correct user agent", ^{
        UIWebView *webView = [UIWebView new];
        NSString *userAgent = [webView stringByEvaluatingJavaScriptFromString:@"navigator.userAgent"];
        assertThat(userAgent, containsString(@"currant"));
    });
});

SpecEnd

