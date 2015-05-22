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
                [webViewController updateWithURL:[NSURL URLWithString:fromURLStr]];
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
                [webViewController updateWithURL:[NSURL URLWithString:[queryDictionary[@"return_url"] URLDecode] relativeToURL:[CUTEConfiguration hostURL]]];
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
