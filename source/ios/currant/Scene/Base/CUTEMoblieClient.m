//
//  CUTEMoblieClient.m
//  currant
//
//  Created by Foster Yin on 4/23/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEMoblieClient.h"
#import "CUTECommonMacro.h"
#import "CUTEDataManager.h"
#import "CUTETicket.h"
#import "CUTERentPropertyInfoViewController.h"
#import "CUTEPropertyInfoForm.h"
#import "CUTEEnumManager.h"
#import "CUTENotificationKey.h"
#import "CUTEWebViewController.h"
#import "NSURL+QueryParser.h"
#import "NSString+Encoding.h"
#import "CUTEConfiguration.h"

@implementation CUTEMoblieClient

- (void)log:(JSValue *)message {
    DebugLog(@"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,message);

}

/*
 TODO call js method may cause crash, maybe we should move all js call back to custom scheme url load
 1   0x2dceb9a1 <redacted>
 2   0x2e7e5395 <redacted>
 3   0x21d621bf <redacted>
 4   0x21c91e78 _CF_forwarding_prep_0
 5   0x2e826b2d <redacted>
 6   0x2e44bbcf <redacted>
 7   0x2dcf4aa1 <redacted>
 8   0x2dd1c1fb <redacted>
 9   0x2dd1c117 WebCore::FrameLoader::load(WebCore::FrameLoadRequest const&)
 10  0x2e7fbb81 <redacted>
 11  0x2e6890dd <redacted>
 12  0x21d24faf <redacted>
 13  0x21d243bf <redacted>
 14  0x21d22a25 <redacted>
 15  0x21c6f201 CFRunLoopRunSpecific
 16  0x21c6f013 CFRunLoopRunInMode
 17  0x2dcd6183 <redacted>
 18  0x30980e23 <redacted>
 19  0x30980d97 _pthread_start
 20  0x3097eb20 thread_start
 */

- (void)signin:(JSValue *)result {
    NSDictionary *dic = [result toDictionary];
    if (dic && [dic isKindOfClass:[NSDictionary class]]) {
        NSError *error = nil;
        CUTEUser *user = (CUTEUser *)[MTLJSONAdapter modelOfClass:[CUTEUser class] fromJSONDictionary:dic error:&error];
        if (!error && user) {
            [[CUTEDataManager sharedInstance] saveAllCookies];
            [[CUTEDataManager sharedInstance] saveUser:user];
        }
    }

    if (self.controller && [self.controller isKindOfClass:[CUTEWebViewController class]]) {
        CUTEWebViewController *webViewController = (CUTEWebViewController *)self.controller;
        UIView *view = [self.controller view];
        if (!IsArrayNilOrEmpty(view.subviews) && [[view subviews][0] isKindOfClass:[UIWebView class]]) {
            UIWebView *webView = (UIWebView *)[view subviews][0];
            NSURL *url = [[webView request] URL];
            NSDictionary *queryDictionary = [url queryDictionary];
            if (queryDictionary && queryDictionary[@"from"]) {
                NSString *fromURLStr = [queryDictionary[@"from"] URLDecode];

                //make sure update webview in main thread, in case of load url crash
                dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                    [webViewController updateWithURL:[NSURL URLWithString:fromURLStr]];
                    [NotificationCenter postNotificationName:KNOTIF_USER_DID_LOGIN object:webViewController];
                });
            }
        }
    }
}

- (void)logout:(JSValue *)result {
    [[CUTEDataManager sharedInstance] cleanAllCookies];
    [[CUTEDataManager sharedInstance] cleanUser];
    if (self.controller && [self.controller isKindOfClass:[CUTEWebViewController class]]) {
        CUTEWebViewController *webViewController = (CUTEWebViewController *)self.controller;
        UIView *view = [self.controller view];
        if (!IsArrayNilOrEmpty(view.subviews) && [[view subviews][0] isKindOfClass:[UIWebView class]]) {
            NSURL *url = [NSURL URLWithString:[result toString] relativeToURL:[CUTEConfiguration hostURL]];
            NSDictionary *queryDictionary = [url queryDictionary];
            if (queryDictionary && queryDictionary[@"return_url"]) {
                //make sure update webview in main thread, in case of load url crash
                dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                    [webViewController updateWithURL:[NSURL URLWithString:CONCAT([queryDictionary[@"return_url"] URLDecode], @"?from=", [webViewController.url.absoluteString URLEncode]? : @"/") relativeToURL:[CUTEConfiguration hostURL]]];
                    [NotificationCenter postNotificationName:KNOTIF_USER_DID_LOGOUT object:webViewController];
                });
            }
        }
    }
}

- (void)editRentTicket:(JSValue *)result {
    NSDictionary *dic = [result toDictionary];
    if (dic && [dic isKindOfClass:[NSDictionary class]]) {
        NSError *error = nil;
        CUTETicket *ticket = (CUTETicket *)[MTLJSONAdapter modelOfClass:[CUTETicket class] fromJSONDictionary:dic error:&error];
        if (!error && ticket) {
            [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_EDIT object:self.controller userInfo:@{@"ticket": ticket}];
        }
    }
}

- (void)wechatShareRentTicket:(JSValue *)result {
    NSDictionary *dic = [[result toDictionary] copy];
    if (dic && [dic isKindOfClass:[NSDictionary class]]) {
        NSError *error = nil;
        CUTETicket *ticket = (CUTETicket *)[MTLJSONAdapter modelOfClass:[CUTETicket class] fromJSONDictionary:dic error:&error];
        if (!error && ticket) {
            [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_WECHAT_SHARE object:self.controller userInfo:@{@"ticket": ticket}];
        }
    }
}

@end
