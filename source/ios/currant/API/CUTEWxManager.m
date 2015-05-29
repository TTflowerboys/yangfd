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
#import <UIImage+Resize.h>
#import <UIImage+BBT.h>
#import <Sequencer/Sequencer.h>
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEImageUploader.h"
#import "CUTEConfiguration.h"
#import "NSURL+Assets.h"
#import "CUTEAPIManager.h"
#import "CUTETracker.h"


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

- (void)shareToWechatWithTitle:(NSString *)title description:(NSString *)description thumbData:(NSData *)imageData  url:(NSString *)url {
    [UIAlertView showWithTitle:STR(@"微信分享") message:nil cancelButtonTitle:STR(@"取消") otherButtonTitles:@[STR(@"分享给微信好友"), STR(@"分享到微信朋友圈")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {

        if([WXApi isWXAppInstalled]){
            if (buttonIndex != alertView.cancelButtonIndex) {
                TrackScreen(@"share-to-wechat");

                BaseReq *req = [self makeWechatRequstWithScene:buttonIndex == 1? WXSceneSession: WXSceneTimeline title:title description:description thumbData:imageData url:url];

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

#define THNUMBNAIL_SIZE CGSizeMake(100, 100)

- (void)shareToWechatWithTicket:(CUTETicket *)ticket {
    Sequencer *sequencer = [Sequencer new];
    NSString *imageURL = IsArrayNilOrEmpty(ticket.property.realityImages)? nil : ticket.property.realityImages.firstObject;
    if (imageURL && [NSURL URLWithString:imageURL].isAssetURL) {
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [SVProgressHUD show];
            [[[CUTEImageUploader sharedInstance] getAssetOrNullFromURL:imageURL] continueWithBlock:^id(BFTask *task) {

                if (task.error) {
                    [SVProgressHUD showErrorWithError:task.error];
                }
                else if (task.exception) {
                    [SVProgressHUD showErrorWithException:task.exception];
                }
                else if (task.isCancelled) {
                    [SVProgressHUD showErrorWithCancellation];
                }
                else {
                    if (IsNilOrNull(task.result)) {
                        [SVProgressHUD showErrorWithStatus:STR(@"图片读取失败")];
                    }
                    else {
                        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^(void){
                            UIImage *image = [UIImage imageWithCGImage:[task.result thumbnail]];
                            if (!image) {
                                image = [UIImage appIcon];
                            }
                            image = [image resizedImage:THNUMBNAIL_SIZE interpolationQuality:kCGInterpolationDefault];
                            dispatch_async(dispatch_get_main_queue(), ^(void) {
                                completion(UIImagePNGRepresentation(image));
                                [SVProgressHUD dismiss];
                            });
                        });
                    }
                }
                return task;
            }];

        }];
    }
    else if (imageURL && ![NSURL URLWithString:imageURL].isAssetURL) {
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [SVProgressHUD show];

            [[[CUTEAPIManager sharedInstance] downloadImage:imageURL] continueWithBlock:^id(BFTask *task) {
                if (task.error) {
                    [SVProgressHUD showErrorWithError:task.error];
                }
                else if (task.exception) {
                    [SVProgressHUD showErrorWithException:task.exception];
                }
                else if (task.isCancelled) {
                    [SVProgressHUD showErrorWithCancellation];
                }
                else {
                    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^(void){
                        UIImage *image = task.result;
                        image = [image resizedImage:THNUMBNAIL_SIZE interpolationQuality:kCGInterpolationDefault];
                        dispatch_async(dispatch_get_main_queue(), ^(void) {
                            completion(UIImagePNGRepresentation(image));
                            [SVProgressHUD dismiss];
                        });
                    });
                }

                return task;
            }];
        }];
    }
    else {
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [SVProgressHUD show];
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^(void){
                UIImage *image = [UIImage appIcon];
                image = [image resizedImage:THNUMBNAIL_SIZE interpolationQuality:kCGInterpolationDefault];
                dispatch_async(dispatch_get_main_queue(), ^(void) {
                    completion(UIImagePNGRepresentation(image));
                    [SVProgressHUD dismiss];
                });
            });
        }];
    }

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[CUTEWxManager sharedInstance] shareToWechatWithTitle:[self truncateString:ticket.titleForDisplay length:512] description:[self truncateString:!IsNilNullOrEmpty(ticket.ticketDescription)? ticket.ticketDescription: ticket.property.address  length:1024] thumbData:result url:[[NSURL URLWithString:CONCAT(@"/wechat-poster/", ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]] absoluteString]];
    }];

    [sequencer run];
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
