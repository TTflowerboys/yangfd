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
#import "CUTEShareManager.h"
#import <RegExCategories.h>
#import "CUTETracker.h"
#import "UIAlertView+Blocks.h"
#import "CUTENotificationKey.h"

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
    return @[@"/user", @"/user_favorites?type=rent"];
}

- (BOOL)isURLLoginRequired:(NSURL *)url {
    return [[self loginRequiredURLPathArray] containsObject:url.path];
}

- (NSURL *)getRedirectToLoginURLFromURL:(NSURL *)url {
    NSURL *originalURL = url;
    return [NSURL WebURLWithString:CONCAT(@"/signin?from=", [originalURL.absoluteString stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding])];

    return url;
}

- (BOOL)isURL:(NSURL *)url matchPath:(NSString *)path {
    NSString *urlPath = [[url path] stringByReplacingOccurrencesOfString:@"_" withString:@"-"];
//    path = [path stringByReplacingOccurrencesOfString:@"_" withString:@"-"];
    return [urlPath isMatch:RX(path)];
}

- (BBTWebBarButtonItem *)getLeftBarItemFromURL:(NSURL *)url {
    if ([self isURL:url matchPath:@"\\/property-to-rent-list"]) {
        return [BBTWebBarButtonItem itemWithImage:IMAGE(@"nav-favor") style:UIBarButtonItemStylePlain actionBlock:^(UIWebView *webView) {
            TrackEvent(@"property-to-rent-list", kEventActionPress, @"open-fav-list", nil);
            [NotificationCenter postNotificationName:KNOTIF_SHOW_FAVORITE_RENT_TICKET_LIST object:nil];
        }];
    }

    return nil;
}

- (BBTWebBarButtonItem *)getRightBarItemFromURL:(NSURL *)url {
    if ([url.path isEqual:@"/"]) {
        return [self getPhoneBarButtonItemWithCompletion:^{
            TrackEvent(GetScreenName(url), kEventActionPress, @"call-yangfd", nil);
        }];
    }
    else if ([self isURL:url matchPath:@"\\/property-list"]) {
        return [BBTWebBarButtonItem itemWithBarButtonSystemItem:UIBarButtonSystemItemRefresh actionBlock:^(UIWebView *webView) {
            [webView reload];
        }];
    }
    else if ([self isURL:url matchPath:@"\\/property\\/[0-9a-fA-F]{24}"]) {
        return [self getPhoneBarButtonItemWithCompletion:^{
            TrackEvent(GetScreenName(url), kEventActionPress, @"call-yangfd", nil);
        }];
    }
    else if ([self isURL:url matchPath:@"\\/property-to-rent\\/[0-9a-fA-F]{24}"]) {
        return [BBTWebBarButtonItem itemWithImage:IMAGE(@"icon-wechat") style:UIBarButtonItemStylePlain actionBlock:^(UIWebView *webView) {
            TrackEvent(@"property-to-rent", kEventActionPress, @"share-to-wechat", nil);
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
                        [[CUTEShareManager sharedInstance] shareToWechatWithTicket:ticket];
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
                        [[CUTEShareManager sharedInstance] shareToWechatWithTicket:ticket];
                    }
                    return nil;
                }];
            }
        }];
    }
    else if ([self isURL:url matchPath:@"\\/property-to-rent-list"]) {
        return [BBTWebBarButtonItem itemWithBarButtonSystemItem:UIBarButtonSystemItemRefresh actionBlock:^(UIWebView *webView) {
            [webView reload];
        }];
    }

    return nil;
}

- (BBTWebBarButtonItem *)getPhoneBarButtonItemWithCompletion:(dispatch_block_t)completion {
    return [BBTWebBarButtonItem itemWithImage:IMAGE(@"nav-phone") style:UIBarButtonItemStylePlain actionBlock:^(UIWebView *webView) {
        NSURL *phoneUrl = [NSURL URLWithString:[NSString  stringWithFormat:@"telprompt:%@",[CUTEConfiguration servicePhone]]];

        if ([[UIApplication sharedApplication] canOpenURL:phoneUrl]) {

            [UIAlertView showWithTitle:STR(@"联系洋房东") message:nil cancelButtonTitle:STR(@"取消") otherButtonTitles:@[STR(@"英国 02030402258"), STR(@"中国 4000926433")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
                if (buttonIndex == 1) {
                    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:[NSString  stringWithFormat:@"tel:%@",[CUTEConfiguration ukServicePhone]]]];
                }
                else if (buttonIndex == 2) {
                    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:[NSString  stringWithFormat:@"tel:%@",[CUTEConfiguration servicePhone]]]];
                }
            }];

        } else
        {
            UIAlertView *calert = [[UIAlertView alloc]initWithTitle:STR(@"电话不可用") message:nil delegate:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil, nil];
            [calert show];
        }
        completion();
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
