//
//  CUTEWxManager.m
//  currant
//
//  Created by Foster Yin on 4/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEShareManager.h"
#import "CUTECommonMacro.h"
#import <UIAlertView+Blocks.h>
#import <UIImage+Resize.h>
#import <UIImage+BBT.h>
#import <Sequencer/Sequencer.h>
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEImageUploader.h"
#import "CUTEConfiguration.h"
#import "NSURL+Assets.h"
#import "CUTEAPIManager.h"
#import "CUTETracker.h"
#import <UMSocial.h>
#import <UMSocialWechatHandler.h>
#import <UMSocialSinaHandler.h>
#import "AppDelegate.h"
#import "UIActionSheet+Blocks.h"


#define THNUMBNAIL_SIZE 100

@interface CUTEShareManager () <UMSocialUIDelegate> {

}

@property(copy) void (^responseBlock)(BaseResp *);

@end


@implementation CUTEShareManager

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

- (void)setUpShareSDK {
    [UMSocialData setAppKey:@"557173da67e58e9316003733"];
    [WXApi registerApp:@"wxa8e7919a58064daa"];
}

- (void)shareToWechatWithReq:(BaseReq *)req {
    if([WXApi isWXAppInstalled]){
        TrackScreen(@"share-to-wechat");
        [self sendRequst:req onResponse:^(BaseResp *resp) {
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
    else {
        [SVProgressHUD showErrorWithStatus:STR(@"请安装微信")];
    }

}

- (BaseReq *)makeWechatRequstWithScene:(NSInteger)scene title:(NSString *)title description:(NSString *)description thumbData:(NSData *)imageData url: (NSString *)url {
    WXMediaMessage *message = [WXMediaMessage message];
    message.title = title;
    message.description = description;
    message.thumbData = imageData;
    WXWebpageObject *ext = [WXWebpageObject object];
    ext.webpageUrl = url;
    message.mediaObject = ext;
    SendMessageToWXReq* req = [[SendMessageToWXReq alloc] init];
    req.bText = NO;
    req.message = message;
    req.scene = scene;
    return req;
}

- (BFTask *)getTicketShareImage:(CUTETicket *)ticket {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    NSString *imageURL = IsArrayNilOrEmpty(ticket.property.realityImages)? nil : ticket.property.realityImages.firstObject;
    if (imageURL && [NSURL URLWithString:imageURL].isAssetURL) {

        [SVProgressHUD showWithStatus:STR(@"获取房产中...")];
        [[[CUTEImageUploader sharedInstance] getAssetOrNullFromURL:imageURL] continueWithBlock:^id(BFTask *task) {

            if (task.error) {
                [tcs setError:task.error];
                [SVProgressHUD showErrorWithError:task.error];
            }
            else if (task.exception) {
                [tcs setException:task.exception];
                [SVProgressHUD showErrorWithException:task.exception];
            }
            else if (task.isCancelled) {
                [tcs cancel];
                [SVProgressHUD showErrorWithCancellation];
            }
            else {
                if (IsNilOrNull(task.result)) {
                    [tcs setResult:nil];
                    [SVProgressHUD showErrorWithStatus:STR(@"图片读取失败")];
                }
                else {
                    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^(void){
                        ALAsset *asset = task.result;
                        UIImage *image = [UIImage imageWithCGImage:asset.defaultRepresentation.fullScreenImage? : asset.thumbnail];
                        if (!image) {
                            image = [UIImage appIcon];
                        }
                        dispatch_async(dispatch_get_main_queue(), ^(void) {
                            [tcs setResult:image];
                            [SVProgressHUD dismiss];
                        });
                    });
                }
            }
            return task;
        }];

    }
    else if (imageURL && ![NSURL URLWithString:imageURL].isAssetURL) {

        [SVProgressHUD showWithStatus:STR(@"获取房产中...")];

        [[[CUTEAPIManager sharedInstance] downloadImage:imageURL] continueWithBlock:^id(BFTask *task) {
            if (task.error) {
                [tcs setError:task.error];
                [SVProgressHUD showErrorWithError:task.error];
            }
            else if (task.exception) {
                [tcs setException:task.exception];
                [SVProgressHUD showErrorWithException:task.exception];
            }
            else if (task.isCancelled) {
                [tcs cancel];
                [SVProgressHUD showErrorWithCancellation];
            }
            else {
                dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^(void){
                    UIImage *image = task.result;
                    dispatch_async(dispatch_get_main_queue(), ^(void) {
                        [tcs setResult:image];
                        [SVProgressHUD dismiss];
                    });
                });
            }
            return task;
        }];

    }
    else {
        UIImage *image = [UIImage appIcon];
        [tcs setResult:image];
    }

    return tcs.task;
}

- (void)shareWithTicket:(CUTETicket *)ticket inController:(UIViewController *)controller {

    [[self getTicketShareImage:ticket] continueWithSuccessBlock:^id(BFTask *task) {
        if (task.result) {
            NSString *title = ticket.titleForDisplay;
            NSString *description = IsNilNullOrEmpty(ticket.ticketDescription)? ticket.property.address: ticket.ticketDescription;
            UIImage *imageData = task.result;
            NSString *url = [[NSURL URLWithString:CONCAT(@"/wechat-poster/", ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]] absoluteString];

            [UIActionSheet showInView:controller.view withTitle:STR(@"分享") cancelButtonTitle:STR(@"取消") destructiveButtonTitle:nil otherButtonTitles:@[STR(@"微信好友"), STR(@"微信朋友圈"), STR(@"新浪微博")] tapBlock:^(UIActionSheet *actionSheet, NSInteger buttonIndex) {

                [actionSheet dismissWithClickedButtonIndex:buttonIndex animated:YES];
                
                if (buttonIndex == 0) {

                    UIImage *image = [(UIImage *)imageData thumbnailImage:THNUMBNAIL_SIZE transparentBorder:0 cornerRadius:0 interpolationQuality:kCGInterpolationDefault];
                    BaseReq *req = [self makeWechatRequstWithScene:WXSceneSession title:title description:description thumbData:UIImagePNGRepresentation(image) url:url];
                    [self shareToWechatWithReq:req];
                }

                else if (buttonIndex == 1) {
                    UIImage *image = [(UIImage *)imageData thumbnailImage:THNUMBNAIL_SIZE transparentBorder:0 cornerRadius:0 interpolationQuality:kCGInterpolationDefault];
                    BaseReq *req = [self makeWechatRequstWithScene: WXSceneTimeline title:title description:description thumbData:UIImagePNGRepresentation(image) url:url];
                    [self shareToWechatWithReq:req];
                }
                else if (buttonIndex == 2) {
                    UIImage *sinaImage = nil;
                    if ([imageData isKindOfClass:[UIImage class]]) {
                        sinaImage = [(UIImage *)imageData thumbnailImage:THNUMBNAIL_SIZE * 3 transparentBorder:0 cornerRadius:0 interpolationQuality:kCGInterpolationDefault];
                    }

                    [[UMSocialControllerService defaultControllerService] setShareText:[self truncateString:CONCAT(NilNullToEmpty(url), @" ", NilNullToEmpty(title), @" ", NilNullToEmpty(description)) length:140] shareImage:sinaImage socialUIDelegate:self];
                    [UMSocialSnsPlatformManager getSocialPlatformWithName:UMShareToSina].snsClickHandler(controller,[UMSocialControllerService defaultControllerService],YES);
                }

            }];
        }
        return nil;
    }];
}

//http://stackoverflow.com/questions/2952298/how-can-i-truncate-an-nsstring-to-a-set-length
- (NSString *)truncateString:(NSString *)str length:(NSInteger)length {
    // define the range you're interested in
    NSRange stringRange = {0, MIN([str length], length)};

    // adjust the range to include dependent chars
    stringRange = [str rangeOfComposedCharacterSequencesForRange:stringRange];

    // Now you can create the short string
    NSString *shortString = [str substringWithRange:stringRange];
    return shortString;
}

- (BOOL)handleOpenURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
    return [WXApi handleOpenURL:url delegate:self];
}

#pragma mark -Base Methods


- (void)sendRequst:(BaseReq *)req onResponse:(void (^)(BaseResp *))onResponse {
    [WXApi sendReq:req];
    self.responseBlock = onResponse;
}

- (void)onReq:(BaseReq *)req {

}

- (void)onResp:(BaseResp *)resp {
    if (self.responseBlock) {
        self.responseBlock(resp);
    }
}


@end
