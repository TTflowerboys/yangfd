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

@interface CUTEShareManager : NSObject <WXApiDelegate>

+ (instancetype)sharedInstance;

- (void)setUpShareSDK;

- (BOOL)handleOpenURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation;

- (void)shareToWechatWithTicket:(CUTETicket *)ticket;

@end
