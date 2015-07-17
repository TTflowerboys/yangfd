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
#import <WeiboSDK.h>
#import "AppDelegate.h"
#import "UIActionSheet+Blocks.h"
#import "ATConnect.h"
#import "CUTEUsageRecorder.h"
#import "CUTEApptentiveEvent.h"
#import "NSArray+ObjectiveSugar.h"


#define THNUMBNAIL_SIZE 100

NSString * const CUTEShareServiceWechatFriend = @"Wechat Friend";

NSString * const CUTEShareServiceWechatCircle= @"Wechat Circle";

NSString * const CUTEShareServiceSinaWeibo = @"Sina Weibo";

@interface CUTEShareManager () <UMSocialUIDelegate, WXApiDelegate, WeiboSDKDelegate> {

}

@property(copy) void (^responseBlock)(BaseResp *);

@property (nonatomic, retain) BFTaskCompletionSource *taskCompletionSource;

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

    [UMSocialData setAppKey:[CUTEConfiguration umengAppKey]];
    [WXApi registerApp:[CUTEConfiguration weixinAPPId]];
#ifdef DEBUG
    [WeiboSDK enableDebugMode:YES];
#endif
    [WeiboSDK registerApp:[CUTEConfiguration sinaAppKey]];
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
                        [self checkCallShareSuccessBlock];
                    });

                }
                else if (backResp.errCode == WXErrCodeUserCancel) {
                    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                        [SVProgressHUD showErrorWithStatus:STR(@"分享取消")];
                        [self checkCallShareCancellationBlock];
                    });
                }
                else {
                    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                        NSError *error = [NSError errorWithDomain:@"Wechat" code:backResp.errCode userInfo:@{NSLocalizedDescriptionKey:backResp.errStr}];
                        [[CUTETracker sharedInstance] trackError:error];
                        [SVProgressHUD showErrorWithStatus:STR(@"分享失败")];
                        [self checkCallShareFailedBlockWithError:error];
                    });
                }
            }
        }];
    }
    else {
        [SVProgressHUD showErrorWithStatus:STR(@"请安装微信")];
    }

}

- (BaseReq *)makeWechatRequstWithScene:(int)scene title:(NSString *)title description:(NSString *)description thumbData:(NSData *)imageData url: (NSString *)url {
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
    NSString *imageURL = IsNilNullOrEmpty(ticket.property.cover)? (IsArrayNilOrEmpty(ticket.property.realityImages)? nil : ticket.property.realityImages.firstObject) : ticket.property.cover;
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

- (NSArray *)defaultShareTitles {
    return [@[CUTEShareServiceWechatFriend, CUTEShareServiceWechatCircle, CUTEShareServiceSinaWeibo] map:^id(id object) {
        return STR(object);
    }];
}

- (BFTask *)shareTicket:(CUTETicket *)ticket viewController:(UIViewController *)viewController
{
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    self.taskCompletionSource = tcs;

    [[self getTicketShareImage:ticket] continueWithSuccessBlock:^id(BFTask *task) {
        if (task.result) {
            NSString *title = ticket.titleForDisplay;
            NSString *description = IsNilNullOrEmpty(ticket.ticketDescription)? ticket.property.address: ticket.ticketDescription;
            UIImage *imageData = task.result;
            NSString *url = [[NSURL URLWithString:CONCAT(@"/wechat-poster/", ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]] absoluteString];

            AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;

            [UIActionSheet showInView:appDelegate.window withTitle:STR(@"分享") cancelButtonTitle:STR(@"取消") destructiveButtonTitle:nil otherButtonTitles:[self defaultShareTitles] tapBlock:^(UIActionSheet *actionSheet, NSInteger buttonIndex) {

                [actionSheet dismissWithClickedButtonIndex:buttonIndex animated:YES];


                dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
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

                        [[[CUTEAPIManager sharedInstance] GET:@"http://api.t.sina.com.cn/short_url/shorten.json" parameters:@{@"url_long": url, @"source": [CUTEConfiguration sinaAppKey]} resultClass:nil resultKeyPath:@""] continueWithBlock:^id(BFTask *task) {
                            NSString *shortUrl = url;
                            NSArray *urlArray = task.result;
                            if (!IsArrayNilOrEmpty(urlArray) && urlArray[0] && urlArray[0][@"url_short"]) {
                                shortUrl = urlArray[0][@"url_short"];
                            }

                            NSInteger maxContentLength = 140;
                            NSString *content = [self truncateString:CONCAT(NilNullToEmpty(title), @" ", NilNullToEmpty(description)) length:maxContentLength - shortUrl.length - 1];
                            content = CONCAT(NilNullToEmpty(content), @" ", NilNullToEmpty(shortUrl));

                            if ([WeiboSDK isCanShareInWeiboAPP]) {
                                WBAuthorizeRequest *authRequest = [WBAuthorizeRequest request];
                                authRequest.redirectURI = [CUTEConfiguration umengCallbackURLString];
                                authRequest.scope = @"all";

                                WBMessageObject *message = [WBMessageObject new];
                                message.text = content;
                                WBImageObject *imageObject = [WBImageObject new];
                                imageObject.imageData = UIImagePNGRepresentation(sinaImage);
                                message.imageObject = imageObject;

                                WBSendMessageToWeiboRequest *request = [WBSendMessageToWeiboRequest requestWithMessage:message authInfo:authRequest access_token:nil];
                                //    request.shouldOpenWeiboAppInstallPageIfNotInstalled = NO;
                                [WeiboSDK sendRequest:request];
                            }
                            else {
                                //TODO test case
                                //Window root controller not ok

                                [[UMSocialControllerService defaultControllerService] setShareText:content shareImage:sinaImage socialUIDelegate:self];
                                [UMSocialSnsPlatformManager getSocialPlatformWithName:UMShareToSina].snsClickHandler(viewController,[UMSocialControllerService defaultControllerService],YES);

                            }

                            return nil;
                        }];

                    }
                    else {
                        [self checkCallShareCancellationBlock];
                    }
                });
            }];
        }
        return nil;
    }];

    return tcs.task;
}

- (BFTask *)shareText:(NSString *)text urlString:(NSString *)urlString inServices:(NSArray *)services viewController:(UIViewController *)viewController {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    self.taskCompletionSource = tcs;

    AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;

    NSArray *otherButtons = nil;
    if (IsArrayNilOrEmpty(services)) {
        otherButtons = [self defaultShareTitles];
    }
    else {
        otherButtons = [services map:^id(NSString *object) {
            return STR(object);
        }];
    }

    [UIActionSheet showInView:appDelegate.window withTitle:STR(@"分享") cancelButtonTitle:STR(@"取消") destructiveButtonTitle:nil otherButtonTitles:otherButtons tapBlock:^(UIActionSheet *actionSheet, NSInteger buttonIndex) {

        [actionSheet dismissWithClickedButtonIndex:buttonIndex animated:YES];

        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            NSString *buttonTitle = [actionSheet buttonTitleAtIndex:buttonIndex];
            
            if ([buttonTitle isEqualToString:STR(CUTEShareServiceWechatFriend)]) {

                BaseReq *req = [self makeWechatRequstWithScene:WXSceneSession title:text description:nil thumbData:UIImagePNGRepresentation([UIImage appIcon]) url:urlString];
                [self shareToWechatWithReq:req];
            }

            else if ([buttonTitle isEqualToString:STR(CUTEShareServiceWechatCircle)]) {
                BaseReq *req = [self makeWechatRequstWithScene: WXSceneTimeline title:text description:nil thumbData:UIImagePNGRepresentation([UIImage appIcon]) url:urlString];
                [self shareToWechatWithReq:req];
            }
            else if ([buttonTitle isEqualToString:STR(CUTEShareServiceSinaWeibo)]) {

                NSInteger maxContentLength = 140;
                NSString *content = [self truncateString:NilNullToEmpty(text) length:maxContentLength - urlString.length];
                content = CONCAT(NilNullToEmpty(content), @" ", NilNullToEmpty(urlString));

                if ([WeiboSDK isCanShareInWeiboAPP]) {
                    WBAuthorizeRequest *authRequest = [WBAuthorizeRequest request];
                    authRequest.redirectURI = [CUTEConfiguration umengCallbackURLString];
                    authRequest.scope = @"all";
                    WBMessageObject *message = [WBMessageObject new];
                    message.text = content;
                    WBImageObject *imageObject = [WBImageObject new];
                    imageObject.imageData = UIImagePNGRepresentation([UIImage appIcon]);
                    message.imageObject = imageObject;

                    WBSendMessageToWeiboRequest *request = [WBSendMessageToWeiboRequest requestWithMessage:message authInfo:authRequest access_token:nil];
                    //    request.shouldOpenWeiboAppInstallPageIfNotInstalled = NO;
                    [WeiboSDK sendRequest:request];
                }
                else {
                    [[UMSocialControllerService defaultControllerService] setShareText:content shareImage:[UIImage appIcon] socialUIDelegate:self];
                    [UMSocialSnsPlatformManager getSocialPlatformWithName:UMShareToSina].snsClickHandler(viewController,[UMSocialControllerService defaultControllerService],YES);
                }
            }
            else {
                [self checkCallShareCancellationBlock];
            }
        });
    }];

    return tcs.task;
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
    if ([url.scheme hasPrefix:@"wx"]) {
        return [WXApi handleOpenURL:url delegate:self];
    }
    else if ([url.scheme hasPrefix:@"wb"]) {
        return [WeiboSDK handleOpenURL:url delegate:self];
    }

    return YES;
}

#pragma mark - UMSocial Delegate

-(void)didFinishGetUMSocialDataInViewController:(UMSocialResponseEntity *)response {

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

#pragma mark - WeiboSDKDelegate

- (void)didReceiveWeiboRequest:(WBBaseRequest *)request {

}

- (void)didReceiveWeiboResponse:(WBBaseResponse *)response {
    if ([response isKindOfClass:WBSendMessageToWeiboResponse.class])
    {
        if (response.statusCode == WeiboSDKResponseStatusCodeSuccess) {
            [SVProgressHUD showSuccessWithStatus:STR(@"发送成功")];
            [self checkCallShareSuccessBlock];
        }
        else if (response.statusCode == WeiboSDKResponseStatusCodeUserCancel) {
            [SVProgressHUD showInfoWithStatus:STR(@"分享取消")];
            [self checkCallShareCancellationBlock];
        }
        else {
            NSError *error = [NSError errorWithDomain:STR(@"微博分享") code:response.statusCode userInfo:response.userInfo];
            [SVProgressHUD showErrorWithError:error];
            [self checkCallShareFailedBlockWithError:error];
        }
    }
}

#pragma mark - Survey Method

- (void)checkCallShareSuccessBlock {
    [self.taskCompletionSource setResult:nil];
}

- (void)checkCallShareFailedBlockWithError:(NSError *)error {
    [self.taskCompletionSource setError:error];
}

- (void)checkCallShareCancellationBlock {
    [self.taskCompletionSource cancel];
}


@end
