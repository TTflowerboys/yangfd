//
//  CUTEWxManager.m
//  currant
//
//  Created by Foster Yin on 4/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEWxManager.h"
#import "CUTECommonMacro.h"
#import <UIAlertView+Blocks.h>
#import "SVProgressHUD+CUTEAPI.h"

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

#pragma mark - Share Method

- (BaseReq *)makeWechatRequstWithScene:(NSInteger)scene title:(NSString *)title description:(NSString *)description url: (NSString *)url {
    WXMediaMessage *message = [WXMediaMessage message];
    message.title = title;
    message.description = description;
    [message setThumbImage:[UIImage imageNamed:@"AppIcon"]];
    WXWebpageObject *ext = [WXWebpageObject object];
    ext.webpageUrl = url;
    message.mediaObject = ext;
    SendMessageToWXReq* req = [[SendMessageToWXReq alloc] init];
    req.bText = NO;
    req.message = message;
    req.scene = scene;
    return req;
}

- (void)shareToWechatWithTitle:(NSString *)title description:(NSString *)description url: (NSString *)url  {
    [UIAlertView showWithTitle:STR(@"微信分享") message:nil cancelButtonTitle:STR(@"取消") otherButtonTitles:@[STR(@"分享给微信好友"), STR(@"分享到微信朋友圈")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {

        if([WXApi isWXAppInstalled] && buttonIndex != alertView.cancelButtonIndex){
            if (buttonIndex != alertView.cancelButtonIndex) {
                BaseReq *req = [self makeWechatRequstWithScene:buttonIndex == 1? WXSceneSession: WXSceneTimeline title:title description:description url:url];

                [[CUTEWxManager sharedInstance] sendRequst:req onResponse:^(BaseResp *resp) {
                    if ([resp isKindOfClass:[SendMessageToWXResp class]]) {
                        SendMessageToWXResp *backResp = (SendMessageToWXResp *)resp;
                        if (backResp.errCode == WXSuccess) {
                            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                                [SVProgressHUD showSuccessWithStatus:STR(@"分享成功")];
                            });

                        }
                        else if (backResp.errCode == WXErrCodeUserCancel) {
                            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                                [SVProgressHUD showErrorWithStatus:STR(@"分享取消")];
                            });
                        }
                        else {
                            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                                [SVProgressHUD showErrorWithStatus:STR(@"分享失败")];
                            });
                        }
                    }
                }];
            }
        }
        else {
            [SVProgressHUD showErrorWithStatus:STR(@"请安装微信")];
        }
    }];
}


#pragma mark -Base Methods

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
