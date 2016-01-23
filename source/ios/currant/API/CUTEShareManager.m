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
#import "CUTEActivityView.h"
#import "CUTEDataManager.h"
#import "NSURL+CUTE.h"
#import "NSString+Truncate.h"


#define THNUMBNAIL_SIZE 100

NSString * const CUTEShareServiceWechatFriend = @"Wechat Friend";

NSString * const CUTEShareServiceWechatCircle= @"Wechat Circle";

NSString * const CUTEShareServiceSinaWeibo = @"Sina Weibo";

NSString * const CUTEShareServiceCopyLink = @"Copy Link";

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

- (void)shareToWechatWithReq:(SendMessageToWXReq *)req {
    if([WXApi isWXAppInstalled]){
        [self sendRequest:req onResponse:^(BaseResp *resp) {
            if ([resp isKindOfClass:[SendMessageToWXResp class]]) {
                SendMessageToWXResp *backResp = (SendMessageToWXResp *)resp;
                if (backResp.errCode == WXSuccess) {
                    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                        if (!self.taskCompletionSource.task.isCompleted) {
                            if (req.scene == WXSceneSession) {
                                [self.taskCompletionSource setResult:CUTEShareServiceWechatFriend];
                            }
                            else if (req.scene == WXSceneTimeline) {
                                [self.taskCompletionSource setResult:CUTEShareServiceWechatCircle];
                            }
                        }
                    });
                }
                else if (backResp.errCode == WXErrCodeUserCancel) {
                    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                        if (!self.taskCompletionSource.task.isCompleted) {
                            [self.taskCompletionSource cancel];
                        }
                    });
                }
                else {
                    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                        if (!self.taskCompletionSource.task.isCompleted) {
                            NSError *error = [NSError errorWithDomain:@"Wechat" code:backResp.errCode userInfo:@{NSLocalizedDescriptionKey:backResp.errStr}];
                            [self.taskCompletionSource setError:error];
                        }
                    });
                }
            }
        }];
    }
    else {
        [SVProgressHUD showErrorWithStatus:STR(@"ShareManager/请安装微信")];
    }

}

- (SendMessageToWXReq *)makeWechatRequstWithScene:(int)scene title:(NSString *)title description:(NSString *)description thumbData:(NSData *)imageData url: (NSString *)url {

    NSString *truncatedTitle = [title truncateWithLength:512];
    NSString *truncatedDescription = [description truncateWithLength:1024];

    WXMediaMessage *message = [WXMediaMessage message];
    message.title = truncatedTitle;
    message.description = truncatedDescription;
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

- (BFTask *)getPropertyShareImage:(CUTEProperty *)property {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    NSString *imageURLString = IsNilNullOrEmpty(property.cover)? (IsArrayNilOrEmpty(property.realityImages)? nil : property.realityImages.firstObject) : property.cover;

    NSURL *assetURL = nil;
    if (imageURLString && [NSURL URLWithString:imageURLString].isAssetURL) {
        assetURL = [NSURL URLWithString:imageURLString];
    }
    else if (imageURLString && ![NSURL URLWithString:imageURLString].isAssetURL) {
        NSString *assetURLString = [[CUTEDataManager sharedInstance] getAssetURLStringForImageURLString:imageURLString];
        if (assetURLString) {
            assetURL = [NSURL URLWithString:assetURLString];
        }
    }

    if (assetURL) {
        [SVProgressHUD showWithStatus:STR(@"ShareManager/获取房产中...")];
        [[[CUTEImageUploader sharedInstance] getAssetOrNullFromURLString:assetURL.absoluteString] continueWithBlock:^id(BFTask *task) {
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
                    [SVProgressHUD showErrorWithStatus:STR(@"ShareManager/图片读取失败")];
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
    else if (imageURLString && [NSURL URLWithString:imageURLString].isHttpOrHttpsURL) {
        [SVProgressHUD showWithStatus:STR(@"ShareManager/获取房产中...")];

        [[[CUTEAPIManager sharedInstance] downloadImage:imageURLString] continueWithBlock:^id(BFTask *task) {
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

- (NSString *)getLocalizedActivityTitle:(NSString *)titleKey {
    NSString *localizedkey = CONCAT(@"ShareManager/", titleKey);
    return STR(localizedkey);
}

- (CUTEActivity *)getWechatFriendActivityWithTitle:(NSString *)title description:(NSString *)description url:(NSString *)url image:(UIImage *)image buttonPressedBlock:(dispatch_block_t)callback {
    CUTEActivity *wechatFriendActivity = [CUTEActivity new];
    wechatFriendActivity.activityTitle = [self getLocalizedActivityTitle:CUTEShareServiceWechatFriend];
    wechatFriendActivity.activityType = CUTEShareServiceWechatFriend;
    wechatFriendActivity.activityImage = IMAGE(@"icon-share-wechat-friend");
    wechatFriendActivity.performActivityBlock = ^ {
        UIImage *thumbnailImage = [(UIImage *)image thumbnailImage:THNUMBNAIL_SIZE transparentBorder:0 cornerRadius:0 interpolationQuality:kCGInterpolationDefault];
        SendMessageToWXReq *req = [self makeWechatRequstWithScene:WXSceneSession title:title description:description thumbData:UIImagePNGRepresentation(thumbnailImage) url:url];
        [self shareToWechatWithReq:req];
        if (callback) {
            callback();
        }
    };
    return wechatFriendActivity;
}

- (CUTEActivity *)getWechatCircleActivityWithTitle:(NSString *)title description:(NSString *)description url:(NSString *)url image:(UIImage *)imageData buttonPressedBlock:(dispatch_block_t)callback {
    CUTEActivity *wechatCircleActivity = [CUTEActivity new];
    wechatCircleActivity.activityTitle = [self getLocalizedActivityTitle:CUTEShareServiceWechatCircle];
    wechatCircleActivity.activityType = CUTEShareServiceWechatCircle;
    wechatCircleActivity.activityImage = IMAGE(@"icon-share-wechat-circle");
    wechatCircleActivity.performActivityBlock = ^ {
        UIImage *image = [(UIImage *)imageData thumbnailImage:THNUMBNAIL_SIZE transparentBorder:0 cornerRadius:0 interpolationQuality:kCGInterpolationDefault];
        SendMessageToWXReq *req = [self makeWechatRequstWithScene: WXSceneTimeline title:title description:description thumbData:UIImagePNGRepresentation(image) url:url];
        [self shareToWechatWithReq:req];
        if (callback) {
            callback();
        }
    };
    return wechatCircleActivity;
}

- (CUTEActivity *)getSinaWeiboActivityWithTitle:(NSString *)title description:(NSString *)description url:(NSString *)url image:(UIImage *)imageData viewController:(UIViewController *)viewController buttonPressedBlock:(dispatch_block_t)callback {
    CUTEActivity *weiboActivity = [CUTEActivity new];
    weiboActivity.activityTitle = [self getLocalizedActivityTitle:CUTEShareServiceSinaWeibo];
    weiboActivity.activityType = CUTEShareServiceSinaWeibo;
    weiboActivity.activityImage = IMAGE(@"icon-share-sina-weibo");
    weiboActivity.performActivityBlock = ^ {
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
            //__NSCFString to NSString
            NSString *content = CONCAT(NilNullToEmpty(title), @" ", NilNullToEmpty(description));
            content = [content truncateWithLength:maxContentLength - shortUrl.length - 1];
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

                if (callback) {
                    callback();
                }
            }
            else {
                //TODO test case
                //Window root controller not ok

                [[UMSocialControllerService defaultControllerService] setShareText:content shareImage:sinaImage socialUIDelegate:self];
                [UMSocialSnsPlatformManager getSocialPlatformWithName:UMShareToSina].snsClickHandler(viewController,[UMSocialControllerService defaultControllerService],YES);

                if (callback) {
                    callback();
                }
            }

            return nil;
        }];
    };
    return weiboActivity;
}

- (CUTEActivityView *)getActivityViewWithTitle:(NSString *)title description:(NSString *)description url:(NSString *)urlString image:(UIImage *)imageData viewController:(UIViewController *)viewController onButtonPressBlock:(CUTEShareButtonPressBlock)pressBlock {
    CUTEActivity *wechatFriendActivity = [self getWechatFriendActivityWithTitle:title description:description url:urlString image:imageData buttonPressedBlock:^{
        if (pressBlock) {
            pressBlock(CUTEShareServiceWechatFriend);
        }
    }];

    CUTEActivity *wechatCircleActivity = [self getWechatCircleActivityWithTitle:title description:description url:urlString image:imageData buttonPressedBlock:^{
        if (pressBlock) {
            pressBlock(CUTEShareServiceWechatCircle);
        }
    }];

    CUTEActivity *weiboActivity = [self getSinaWeiboActivityWithTitle:title description:description url:urlString image:imageData viewController:viewController buttonPressedBlock:^{
        if (pressBlock) {
            pressBlock(CUTEShareServiceSinaWeibo);
        }
    }];

    CUTEActivity *copyLinkActivity = [CUTEActivity new];
    copyLinkActivity.activityTitle = STR(@"ShareManager/复制链接");
    copyLinkActivity.activityType = CUTEShareServiceCopyLink;
    copyLinkActivity.activityImage = IMAGE(@"icon-share-copy-link");
    copyLinkActivity.performActivityBlock = ^ {
        [UIPasteboard generalPasteboard].string = urlString;
        [SVProgressHUD showSuccessWithStatus:STR(@"ShareManager/已复制至粘贴版")];
        if (pressBlock) {
            pressBlock(CUTEShareServiceCopyLink);
        }
    };

    NSArray *acitivies = @[wechatFriendActivity, wechatCircleActivity, weiboActivity, copyLinkActivity];
    CUTEActivityView *activityView = [[CUTEActivityView alloc] initWithAcitities:acitivies];
    return activityView;
}

- (BFTask *)shareTicket:(CUTETicket *)ticket viewController:(UIViewController *)viewController onButtonPressBlock:(CUTEShareButtonPressBlock)pressBlock
{
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    self.taskCompletionSource = tcs;

    [[self getPropertyShareImage:ticket.property] continueWithSuccessBlock:^id(BFTask *task) {
        if (task.result) {
            NSString *title = ticket.titleForDisplay;
            NSString *description = IsNilNullOrEmpty(ticket.ticketDescription)? ticket.property.address: ticket.ticketDescription;
            UIImage *imageData = task.result;
            NSString *urlString = [[NSURL URLWithString:CONCAT(@"/wechat-poster/", ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]] absoluteString];
            CUTEActivityView *activityView = [self getActivityViewWithTitle:title description:description url:urlString image:imageData viewController:viewController onButtonPressBlock:pressBlock];
            activityView.onDismissButtonPressedBlock = ^ {
                if (!self.taskCompletionSource.task.isCompleted) {
                    [self.taskCompletionSource cancel];
                }
            };

            activityView.activityTitle = STR(@"RentShare/分享此房源移动主页");
            [activityView show:YES];

        }
        return nil;
    }];

    return tcs.task;
}

- (BFTask *)shareProperty:(CUTEProperty *)property viewController:(UIViewController *)viewController onButtonPressBlock:(CUTEShareButtonPressBlock)pressBlock
{
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    self.taskCompletionSource = tcs;

    [[self getPropertyShareImage:property] continueWithSuccessBlock:^id(BFTask *task) {
        if (task.result) {
            NSString *title = property.name;
            NSString *description = IsNilNullOrEmpty(property.propertyDescription)? property.address: property.propertyDescription;
            UIImage *imageData = task.result;
            NSString *urlString = [[NSURL URLWithString:CONCAT(@"/property/", property.identifier) relativeToURL:[CUTEConfiguration hostURL]] absoluteString];

            CUTEActivityView *activityView = [self getActivityViewWithTitle:title description:description url:urlString image:imageData viewController:viewController onButtonPressBlock:pressBlock];
            activityView.onDismissButtonPressedBlock = ^ {
                if (!self.taskCompletionSource.task.isCompleted) {
                    [self.taskCompletionSource cancel];
                }
            };

            [activityView show:YES];
        }
        return nil;
    }];

    return tcs.task;
}

- (BFTask *)shareText:(NSString *)text urlString:(NSString *)urlString imageUrl:(NSString *)imageUrl inServices:(NSArray *)services viewController:(UIViewController *)viewController onButtonPressBlock:(CUTEShareButtonPressBlock)pressBlock {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    self.taskCompletionSource = tcs;

    Sequencer *sequencer = [Sequencer new];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        if (imageUrl && [NSURL URLWithString:imageUrl].isHttpOrHttpsURL) {

            [[[CUTEAPIManager sharedInstance] downloadImage:imageUrl] continueWithBlock:^id(BFTask *task) {
                if (task.error) {
                    [tcs setError:task.error];
                }
                else if (task.exception) {
                    [tcs setException:task.exception];
                }
                else if (task.isCancelled) {
                    [tcs cancel];
                }
                else {
                    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^(void){
                        UIImage *image = task.result;
                        dispatch_async(dispatch_get_main_queue(), ^(void) {
                            completion(image);
                        });
                    });
                }
                return task;
            }];
        }
        else {
            UIImage *image = [UIImage appIcon];
            completion(image);
        }

    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        NSArray *activityKeys = nil;
        if (IsArrayNilOrEmpty(services)) {
            activityKeys = @[CUTEShareServiceWechatFriend, CUTEShareServiceWechatCircle, CUTEShareServiceSinaWeibo];
        }
        else {
            activityKeys = services;
        }
        NSString *title = text;
        UIImage *imageData = result;

        NSMutableArray *activities = [NSMutableArray array];

        if ([activityKeys containsObject:CUTEShareServiceWechatFriend]) {
            [activities addObject:[self getWechatFriendActivityWithTitle:title description:nil url:urlString image:imageData buttonPressedBlock:^{
                if (pressBlock) {
                    pressBlock(CUTEShareServiceWechatFriend);
                }
            }]];
        }

        if ([activityKeys containsObject:CUTEShareServiceWechatCircle]) {
            [activities addObject:[self getWechatCircleActivityWithTitle:title description:nil url:urlString image:imageData buttonPressedBlock:^{
                if (pressBlock) {
                    pressBlock(CUTEShareServiceWechatCircle);
                }
            }]];
        }

        if ([activityKeys containsObject:CUTEShareServiceSinaWeibo]) {
            [activities addObject:[self getSinaWeiboActivityWithTitle:title description:nil url:urlString image:imageData viewController:viewController buttonPressedBlock:^{
                if (pressBlock) {
                    pressBlock(CUTEShareServiceSinaWeibo);
                }
            }]];
        }

        CUTEActivityView *activityView = [[CUTEActivityView alloc] initWithAcitities:activities];
        activityView.onDismissButtonPressedBlock = ^ {
            if (!self.taskCompletionSource.task.isCompleted) {
                [self.taskCompletionSource cancel];
            }
        };

        [activityView show:YES];
    }];

    [sequencer run];

    return tcs.task;
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

    if (response.responseType == UMSResponseShareToSNS || response.responseType == UMSResponseShareToMutilSNS) {
        if (response.responseCode == UMSResponseCodeSuccess) {
            [self.taskCompletionSource setResult:CUTEShareServiceSinaWeibo];
        }
        else if (response.responseCode == UMSResponseCodeCancel) {
            [self.taskCompletionSource cancel];
        }
        else {
            NSError *error = [NSError errorWithDomain:STR(@"ShareManager/微博分享") code:response.responseCode userInfo:@{NSLocalizedDescriptionKey: response.description}];
            [self.taskCompletionSource setError:error];
        }
    }
}

#pragma mark -Base Methods


- (void)sendRequest:(BaseReq *)req onResponse:(void (^)(BaseResp *))onResponse {
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
            [self.taskCompletionSource setResult:CUTEShareServiceSinaWeibo];
        }
        else if (response.statusCode == WeiboSDKResponseStatusCodeUserCancel) {
            [self.taskCompletionSource cancel];
        }
        else {
            NSError *error = [NSError errorWithDomain:STR(@"ShareManager/微博分享") code:response.statusCode userInfo:response.userInfo];
            [self.taskCompletionSource setError:error];
        }
    }
}

@end
