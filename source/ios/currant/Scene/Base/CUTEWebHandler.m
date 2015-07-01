//
//  CUTEWebHandler.m
//  currant
//
//  Created by Foster Yin on 6/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEWebHandler.h"
#import "CUTETracker.h"
#import "CUTEUser.h"
#import "CUTEDataManager.h"
#import "CUTEWebViewController.h"
#import "NSString+Encoding.h"
#import "CUTECommonMacro.h"
#import "CUTENotificationKey.h"
#import "NSURL+QueryParser.h"
#import "CUTEConfiguration.h"
#import "CUTEUsageRecorder.h"
#import "CUTESurveyHelper.h"
#import "CUTEApptentiveEvent.h"
#import "ATConnect.h"

@implementation CUTEWebHandler

- (void)setupWithWebView:(UIWebView *)webView viewController:(CUTEWebViewController *)webViewController {

    [self.bridge registerHandler:@"handshake" handler:^(id data, WVJBResponseCallback responseCallback) {
        TrackEvent(KEventCategorySystem, @"handshake", webView.request.URL.absoluteString, nil);
    }];

    [self.bridge registerHandler:@"login" handler:^(id data, WVJBResponseCallback responseCallback) {
        NSDictionary *dic = data;
        if (dic && [dic isKindOfClass:[NSDictionary class]]) {
            NSError *error = nil;
            CUTEUser *user = (CUTEUser *)[MTLJSONAdapter modelOfClass:[CUTEUser class] fromJSONDictionary:dic error:&error];
            if (!error && user) {
                [[CUTEDataManager sharedInstance] persistAllCookies];
                [[CUTEDataManager sharedInstance] saveUser:user];
            }
        }

        UIView *view = [webViewController view];
        if (!IsArrayNilOrEmpty(view.subviews) && [[view subviews][0] isKindOfClass:[UIWebView class]]) {
            UIWebView *webView = (UIWebView *)[view subviews][0];
            NSURL *url = [[webView request] URL];
            NSDictionary *queryDictionary = [url queryDictionary];
            if (queryDictionary && queryDictionary[@"from"]) {
                NSString *fromURLStr = [queryDictionary[@"from"] URLDecode];
                [webViewController updateWithURL:[NSURL URLWithString:fromURLStr]];
                [NotificationCenter postNotificationName:KNOTIF_USER_DID_LOGIN object:webViewController];
                responseCallback(nil);
            }
        }
    }];

    [self.bridge registerHandler:@"logout" handler:^(id data, WVJBResponseCallback responseCallback) {

        [[CUTEDataManager sharedInstance] clearAllCookies];
        [[CUTEDataManager sharedInstance] clearUser];
        UIView *view = [webViewController view];
        if (!IsArrayNilOrEmpty(view.subviews) && [[view subviews][0] isKindOfClass:[UIWebView class]]) {
            NSURL *url = [NSURL URLWithString:data relativeToURL:[CUTEConfiguration hostURL]];
            NSDictionary *queryDictionary = [url queryDictionary];
            if (queryDictionary && queryDictionary[@"return_url"]) {
                [webViewController updateWithURL:[NSURL URLWithString:CONCAT([queryDictionary[@"return_url"] URLDecode], @"?from=", [webViewController.url.absoluteString URLEncode]? : @"/") relativeToURL:[CUTEConfiguration hostURL]]];
                [NotificationCenter postNotificationName:KNOTIF_USER_DID_LOGOUT object:webViewController];
            }
        }
    }];

    [self.bridge registerHandler:@"editRentTicket" handler:^(id data, WVJBResponseCallback responseCallback) {

        NSDictionary *dic = data;
        if (dic && [dic isKindOfClass:[NSDictionary class]]) {
            NSError *error = nil;
            CUTETicket *ticket = (CUTETicket *)[MTLJSONAdapter modelOfClass:[CUTETicket class] fromJSONDictionary:dic error:&error];
            if (!error && ticket) {
                [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_EDIT object:webViewController userInfo:@{@"ticket": ticket}];
            }
        }
    }];

    [self.bridge registerHandler:@"createRentTicket" handler:^(id data, WVJBResponseCallback responseCallback) {
        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_CREATE object:webViewController userInfo:nil];
    }];

    [self.bridge registerHandler:@"shareRentTicket" handler:^(id data, WVJBResponseCallback responseCallback) {
        NSDictionary *dic = data;
        if (dic && [dic isKindOfClass:[NSDictionary class]]) {
            NSError *error = nil;
            CUTETicket *ticket = (CUTETicket *)[MTLJSONAdapter modelOfClass:[CUTETicket class] fromJSONDictionary:dic error:&error];
            if (!error && ticket) {
                [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_WECHAT_SHARE object:self userInfo:@{@"ticket": ticket}];
            }
        }
    }];

    //TODO remove this action in html files, this has been updated by the delegate hook
    [self.bridge registerHandler:@"openURLInNewController" handler:^(id data, WVJBResponseCallback responseCallback) {
        [webViewController loadRequesetInNewController:[NSURLRequest requestWithURL:[NSURL URLWithString:data relativeToURL:[CUTEConfiguration hostURL]]]];
    }];

    [self.bridge registerHandler:@"openRentListTab" handler:^(id data, WVJBResponseCallback responseCallback) {
        [NotificationCenter postNotificationName:KNOTIF_SHOW_RENT_TICKET_LIST_TAB object:nil];
    }];

    [self.bridge registerHandler:@"openPropertyListTab" handler:^(id data, WVJBResponseCallback responseCallback) {
        [NotificationCenter postNotificationName:KNOTIF_SHOW_PROPERTY_LIST_TAB object:nil];
    }];

    [self.bridge registerHandler:@"notifyRentTicketIsRented" handler:^(id data, WVJBResponseCallback responseCallback) {
        [CUTESurveyHelper checkShowRentTicketDidBeRentedSurveyWithViewController:webViewController];
    }];

    [self.bridge registerHandler:@"notifyUserHaveFavoriteRentTicket" handler:^(id data, WVJBResponseCallback responseCallback) {
        [CUTESurveyHelper checkShowFavoriteRentTicketSurveyWithViewController:webViewController];
    }];
}

@end
