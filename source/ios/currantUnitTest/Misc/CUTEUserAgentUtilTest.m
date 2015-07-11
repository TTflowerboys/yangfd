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
#import "CUTEAPIManager.h"
#import "BBTRestClient.h"

@interface CUTEAPIManager (Private)

@property (nonatomic, readonly) BBTRestClient *backingManager;

@end

SpecBegin(UserAgentUtil)

describe(@"setupUserAgent", ^ {

    it(@"should setup ok", ^ {
        NSString *userAgent = [[NSUserDefaults standardUserDefaults] stringForKey:@"UserAgent"];
        assertThat(userAgent, equalTo([CUTEUserAgentUtil userAgent]));
        assertThat(userAgent, containsString(@"currant"));
        assertThat(userAgent, notNilValue());
    });

    it(@"webview should have correct user agent", ^{
        UIWebView *webView = [UIWebView new];
        NSString *userAgent = [webView stringByEvaluatingJavaScriptFromString:@"navigator.userAgent"];
        assertThat(userAgent, notNilValue());
        assertThat(userAgent, equalTo([CUTEUserAgentUtil userAgent]));
        assertThat(userAgent, containsString(@"currant"));
    });
});

describe(@"userAgent", ^{

    it(@"should set AFNetworking user agent ok", ^{

        NSURLRequest *request = [[[[CUTEAPIManager sharedInstance] backingManager] requestSerializer] requestWithMethod:@"GET" URLString:@"www.baidu.com" parameters:nil error:nil];
        NSString *userAgent = [request allHTTPHeaderFields][@"User-Agent"];
        assertThat(userAgent, notNilValue());
        assertThat(userAgent, equalTo([CUTEUserAgentUtil userAgent]));
        assertThat(userAgent, containsString(@"currant"));
    });
});

SpecEnd
