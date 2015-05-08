//
//  CUTEWxManager.h
//  currant
//
//  Created by Foster Yin on 4/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "WXApi.h"
#import "CUTETicket.h"

@interface CUTEWxManager : NSObject <WXApiDelegate>

+ (void)registerWeixinAPIKey:(NSString *)weixinAPIKey;

+ (instancetype)sharedInstance;

- (BOOL)handleOpenURL:(NSURL *)url;

- (void)sendRequst:(BaseReq *)req onResponse:(void (^)(BaseResp *response))onResponse;

- (void)shareToWechatWithTicket:(CUTETicket *)ticket;

@end
