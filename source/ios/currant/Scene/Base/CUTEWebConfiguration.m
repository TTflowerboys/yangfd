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
#import <RegExCategories.h>

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

- (BOOL)isURL:(NSURL *)url matchPath:(NSString *)path {
    NSString *urlPath = [[url path] stringByReplacingOccurrencesOfString:@"_" withString:@"-"];
//    path = [path stringByReplacingOccurrencesOfString:@"_" withString:@"-"];
    return [urlPath isMatch:RX(path)];
}

- (BBTWebBarButtonItem *)getRightBarItemFromURL:(NSURL *)url {
    if ([url.path isEqual:@"/"]) {
        return [self getPhoneBarButtonItem];
    }
    else if ([self isURL:url matchPath:@"\\/property-list"]) {
        return [self getPhoneBarButtonItem];

    }
    else if ([self isURL:url matchPath:@"\\/property\\/[0-9a-fA-F]{24}"]) {
        return [self getPhoneBarButtonItem];
    }
    else if ([self isURL:url matchPath:@"\\/property-to-rent\\/[0-9a-fA-F]{24}"]) {
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
                        [SVProgressHUD dismiss];
                        CUTETicket *ticket = task.result;
                        [[CUTEWxManager sharedInstance] shareToWechatWithTicket:ticket];
                    }
                    return nil;
                }];
            }
        }];
    }
    else if ([self isURL:url matchPath:@"\\/wechat-poster\\/[0-9a-fA-F]{24}"]) {
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
                        [SVProgressHUD dismiss];
                        CUTETicket *ticket = task.result;
                        [[CUTEWxManager sharedInstance] shareToWechatWithTicket:ticket];
                    }
                    return nil;
                }];
            }
        }];
    }
    else if ([self isURL:url matchPath:@"\\/property-to-rent-list"] && [CUTEDataManager sharedInstance].isUserLoggedIn) {
        return [BBTWebBarButtonItem itemWithImage:IMAGE(@"nav-favor") style:UIBarButtonItemStylePlain actionBlock:^(UIWebView *webView) {
            [webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"/user_favorites?type=rent" relativeToURL:[CUTEConfiguration hostURL]]]];
        }];
    }

    return nil;
}

- (BBTWebBarButtonItem *)getPhoneBarButtonItem {
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

- (NSString *)getTitleFormURL:(NSURL *)url {
    NSDictionary *titleDictionary = @{@"/": STR(@"洋房东"),
                                      @"/property-list": STR(@"房产列表-洋房东"),
                                      @"/property-to-rent-list": STR(@"出租列表-洋房东"),
                                      @"/property": STR(@"房产详情"),
                                      @"/property-to-rent": STR(@"出租详情"),
                                      @"/user": STR(@"用户中心"),
                                      @"/signin": STR(@"登录"),
                                      @"/signup": STR(@"注册")
                                      };
    NSArray *paths = [url.path componentsSeparatedByString:@"/"];
    if (paths.count >=2) {
        return titleDictionary[CONCAT(@"/", [paths[1] stringByReplacingOccurrencesOfString:@"_" withString:@"-"])];
    }
    return STR(@"洋房东");
}


@end
