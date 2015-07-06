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

@interface CUTEShareManager : NSObject

+ (instancetype)sharedInstance;

- (void)setUpShareSDK;

- (BOOL)handleOpenURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation;

- (void)shareTicket:(CUTETicket *)ticket inController:(UIViewController *)controller successBlock:(dispatch_block_t)successBlock cancellationBlock:(dispatch_block_t)cancellationBlock;

- (void)shareText:(NSString *)text urlString:(NSString *)urlString inController:(UIViewController *)controller successBlock:(dispatch_block_t)successBlock cancellationBlock:(dispatch_block_t)cancellationBlock;

@end
