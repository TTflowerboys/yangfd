//
//  CUTEWxManager.h
//  currant
//
//  Created by Foster Yin on 4/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "WXApi.h"
#import "CUTETicket.h"
#import "BFTask.h"

NSString *CUTEShareServiceWechatFriend = @"Wechat Friend";

NSString *CUTEShareServiceWechatCircle= @"Wechat Circle";

NSString *CUTEShareServiceSinaWeibo = @"Sina Weibo";


@interface CUTEShareManager : NSObject

+ (instancetype)sharedInstance;

- (void)setUpShareSDK;

- (BOOL)handleOpenURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation;

- (BFTask *)shareTicket:(CUTETicket *)ticket;

- (BFTask *)shareText:(NSString *)text urlString:(NSString *)urlString inServices:(NSArray *)services;

@end
