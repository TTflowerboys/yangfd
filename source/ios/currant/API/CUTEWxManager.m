//
//  CUTEWxManager.m
//  currant
//
//  Created by Foster Yin on 4/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEWxManager.h"

@interface CUTEWxManager () {

}

@property(copy) void (^responseBlock)(BaseResp *);

@end


@implementation CUTEWxManager


+ (void)registerWeixinAPIKey:(NSString *)weixinAPIKey
{
    [WXApi registerApp:weixinAPIKey];
}

+ (instancetype)sharedInstance
{
    static dispatch_once_t pred;
    __strong static id sharedInstance = nil;

    dispatch_once(&pred, ^{
        sharedInstance = [[[self class] alloc] init];
    });

    return sharedInstance;
}

- (BOOL)handleOpenURL:(NSURL *)url {
    return [WXApi handleOpenURL:url delegate:self];
}

- (void)sendRequst:(BaseReq *)req onResponse:(void (^)(BaseResp *))onResponse {
    [WXApi sendReq:req];
    self.responseBlock = onResponse;
}

- (void)onReq:(BaseReq *)req {

}

- (void)onResp:(BaseResp *)resp {
    self.responseBlock(resp);
}


@end
