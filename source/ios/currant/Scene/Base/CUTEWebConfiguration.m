//
//  CUTEWebConfiguration.m
//  currant
//
//  Created by Foster Yin on 4/30/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEWebConfiguration.h"
#import "CUTEDataManager.h"
#import "CUTECommonMacro.h"
#import "CUTEConfiguration.h"
#import "NSURL+CUTE.h"
#import "CUTEAPIManager.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEWxManager.h"

@implementation CUTEWebConfiguration

+ (instancetype)sharedInstance
{
    static dispatch_once_t pred;
    __strong static id sharedInstance = nil;

    dispatch_once(&pred, ^{
        sharedInstance = [[[self class] alloc] init];
    });

    return sharedInstance;
}

- (NSArray *)loginRequiredURLPathArray {
    return @[@"/user"];
}

- (NSURL *)getRedirectToLoginURLFromURL:(NSURL *)url {
    if ([[self loginRequiredURLPathArray] containsObject:url.path] && ![[CUTEDataManager sharedInstance] isUserLoggedIn]) {
        NSURL *originalURL = url;
        return [NSURL WebURLWithString:CONCAT(@"/signin?from=", [originalURL.absoluteString stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding])];
    }

    return url;
}

- (BBTWebBarButtonItem *)getRightBarItemFromURL:(NSURL *)url {
    if ([url.path hasPrefix:@"/property-to-rent"]) {
        return [BBTWebBarButtonItem itemWithImage:IMAGE(@"icon-wechat") style:UIBarButtonItemStylePlain actionBlock:^(UIWebView *webView) {
            NSArray *paths = [url.path componentsSeparatedByString:@"/"];
            if (paths.count >= 3) {
                NSString *ticketId = paths[2];
                [SVProgressHUD show];
                [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/rent_ticket/", ticketId) parameters:nil resultClass:[CUTETicket class]] continueWithBlock:^id(BFTask *task) {
                    if (task.error || task.exception || task.isCancelled) {
                        [SVProgressHUD showErrorWithError:task.error];
                    }
                    else {
                        CUTETicket *ticket = task.result;
                        [[CUTEWxManager sharedInstance] shareToWechatWithTicket:ticket];
                        [SVProgressHUD dismiss];
                    }
                    return nil;
                }];
            }
        }];
    }
    return [BBTWebBarButtonItem itemWithImage:IMAGE(@"nav-phone") style:UIBarButtonItemStylePlain actionBlock:^(UIWebView *webView) {
        NSURL *phoneUrl = [NSURL URLWithString:[NSString  stringWithFormat:@"telprompt:%@",[CUTEConfiguration servicePhone]]];

        if ([[UIApplication sharedApplication] canOpenURL:phoneUrl]) {
            [[UIApplication sharedApplication] openURL:phoneUrl];
        } else
        {
            UIAlertView *calert = [[UIAlertView alloc]initWithTitle:STR(@"电话不可用") message:nil delegate:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil, nil];
            [calert show];
        }
    }];
}


@end
