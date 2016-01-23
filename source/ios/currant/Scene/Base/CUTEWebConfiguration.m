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
#import "CUTEPhoneUtil.h"
#import "NSString+Encoding.h"
#import "currant-Swift.h"

@interface CUTEWebConfiguration () {

    NSDictionary<NSString *, NSString *> * _routes;

}

@property NSDictionary<NSString *, NSString *> *routes;

@end

@implementation CUTEWebConfiguration

+ (instancetype)sharedInstance
{
    static dispatch_once_t pred;
    __strong static id sharedInstance = nil;

    dispatch_once(&pred, ^{
        sharedInstance = [[[self class] alloc] init];
        NSString *path = [[NSBundle mainBundle] pathForResource:@"routes" ofType:@"plist"];
        ((CUTEWebConfiguration *)sharedInstance).routes = [NSDictionary dictionaryWithContentsOfFile:path];
    });

    return sharedInstance;
}


//- (NSArray *)loginRequiredURLPathArray {
//    return @[@"/user", @"/user-favorites", @"/user-properties"];
//}
//
//- (NSArray *)needRefreshContentWhenUserChangeURLPathArray {
//    return @[@"/requirement"];
//}

//- (BOOL)isURLLoginRequired:(NSURL *)url {
//    NSString *urlPath = [[url path] stringByReplacingOccurrencesOfString:@"_" withString:@"-"];
//    return [[self loginRequiredURLPathArray] containsObject:urlPath];
//}
//
//- (BOOL)isURLNeedRefreshContentWhenUserChange:(NSURL *)url {
//    //like http://currant-dev.bbtechgroup.com/requirement?budget=&intention=&property=
//    NSString *urlPath = [[url path] stringByReplacingOccurrencesOfString:@"_" withString:@"-"];
//    return [[self needRefreshContentWhenUserChangeURLPathArray] containsObject:urlPath];
//}
//
//- (NSURL *)getRedirectToLoginURLFromURL:(NSURL *)url {
//    NSURL *originalURL = url;
//    return [NSURL URLWithString:CONCAT(@"/signin?from=", [originalURL.absoluteString URLEncode]) relativeToURL:[CUTEConfiguration hostURL]];
//
//    return url;
//}
//
- (BOOL)isURL:(NSURL *)url matchPath:(NSString *)path {
    NSString *urlPath = [[url path] stringByReplacingOccurrencesOfString:@"_" withString:@"-"];
//    path = [path stringByReplacingOccurrencesOfString:@"_" withString:@"-"];
    return [urlPath isMatch:RX(path)];
}

- (BBTWebBarButtonItem *)getLeftBarItemFromURL:(NSURL *)url {
    if ([self isURL:url matchPath:@"\\/property-to-rent-list"]) {
        BBTWebBarButtonItem *barButtonItem = [BBTWebBarButtonItem itemWithImage:IMAGE(@"nav-favor") style:UIBarButtonItemStylePlain actionBlock:^(UIViewController *viewController)
        {
            TrackEvent(@"property-to-rent-list", kEventActionPress, @"open-fav-list", nil);
            NSURL *itemURL = [CUTEPermissionChecker URLWithPath:@"/user-favorites#rent"];
            [viewController.navigationController openRouteWithURL:itemURL];
        }];
        barButtonItem.tag = FAVORITE_BAR_BUTTON_ITEM_TAG;

        return barButtonItem;
    }
    else if ([self isURL:url matchPath:@"\\/property-list"]) {
        BBTWebBarButtonItem *barButtonItem = [BBTWebBarButtonItem itemWithImage:IMAGE(@"nav-favor") style:UIBarButtonItemStylePlain actionBlock:^(UIViewController *viewController) {
            TrackEvent(@"property-list", kEventActionPress, @"open-fav-list", nil);
            NSURL *itemURL = [CUTEPermissionChecker URLWithPath:@"/user-favorites#own"];
            [viewController.navigationController openRouteWithURL:itemURL];
        }];
        barButtonItem.tag = FAVORITE_BAR_BUTTON_ITEM_TAG;

        return barButtonItem;
    }

    return nil;
}

- (BBTWebBarButtonItem *)getRightBarItemFromURL:(NSURL *)url {
    if ([url.path isEqual:@"/"]) {
        return [self getPhoneBarButtonItemWithCompletion:^{
            TrackEvent(GetScreenName(url), kEventActionPress, @"call-yangfd", nil);
        }];
    }
    else if ([self isURL:url matchPath:@"\\/property\\/[0-9a-fA-F]{24}"]) {
        return [BBTWebBarButtonItem itemWithImage:IMAGE(@"nav-share") style:UIBarButtonItemStylePlain actionBlock:^(UIViewController *viewController) {
            TrackEvent(@"property", kEventActionPress, @"share", nil);
            NSArray *paths = [url.path componentsSeparatedByString:@"/"];
            if (paths.count >= 3) {
                NSString *propertyId = paths[2];
                [SVProgressHUD show];
                [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/property/", propertyId) parameters:nil resultClass:[CUTEProperty class]] continueWithBlock:^id(BFTask *task) {
                    if (task.error || task.exception || task.isCancelled) {
                        [SVProgressHUD showErrorWithError:task.error];
                    }
                    else {
                        [SVProgressHUD dismiss];
                        CUTEProperty *property = task.result;
                        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_PROPERTY_SHARE object:self userInfo:@{@"property": property}];

                    }
                    return nil;
                }];
            }
        }];
    }
    else if ([self isURL:url matchPath:@"\\/property-to-rent\\/[0-9a-fA-F]{24}"]) {
        //TODO: fix press twice time bug
        return [BBTWebBarButtonItem itemWithImage:IMAGE(@"nav-share") style:UIBarButtonItemStylePlain actionBlock:^(UIViewController *viewController) {
            TrackEvent(@"property-to-rent", kEventActionPress, @"share", nil);
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
                        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_WECHAT_SHARE object:self userInfo:@{@"ticket": ticket}];

                    }
                    return nil;
                }];
            }
        }];
    }
    else if ([self isURL:url matchPath:@"\\/wechat-poster\\/[0-9a-fA-F]{24}"]) {
        return [BBTWebBarButtonItem itemWithImage:IMAGE(@"nav-share") style:UIBarButtonItemStylePlain actionBlock:^(UIViewController *viewController) {
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
                        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_WECHAT_SHARE object:self userInfo:@{@"ticket": ticket}];
                        
                    }
                    return nil;
                }];
            }
        }];
    }

    return nil;
}

- (BBTWebBarButtonItem *)getPhoneBarButtonItemWithCompletion:(dispatch_block_t)completion {
    return [BBTWebBarButtonItem itemWithImage:IMAGE(@"nav-phone") style:UIBarButtonItemStylePlain actionBlock:^(UIViewController *viewController) {
        [CUTEPhoneUtil showServicePhoneAlert];
        completion();
    }];
}

- (NSString *)getTitleFormURL:(NSURL *)url {
    NSDictionary *titleDictionary = @{@"/": STR(@"WebConfiguration/洋房东"),
                                      @"/property-list": STR(@"WebConfiguration/房产列表-洋房东"),
                                      @"/property-to-rent-list": STR(@"WebConfiguration/出租列表-洋房东"),
                                      @"/property": STR(@"WebConfiguration/房产详情"),
                                      @"/property-to-rent": STR(@"WebConfiguration/出租详情"),
                                      @"/user": STR(@"WebConfiguration/用户中心"),
                                      @"/signin": STR(@"WebConfiguration/登录"),
                                      @"/signup": STR(@"WebConfiguration/注册")
                                      };
    NSArray *paths = [url.path componentsSeparatedByString:@"/"];
    if (paths.count >=2) {
        return titleDictionary[CONCAT(@"/", [paths[1] stringByReplacingOccurrencesOfString:@"_" withString:@"-"])];
    }
    return STR(@"WebConfiguration/洋房东");
}


- (NSDictionary<NSString *, NSString *> *)getRoutes {
    return self.routes;
}


@end
