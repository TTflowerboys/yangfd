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
#import <ShareSDK/ShareSDK.h>


#define THNUMBNAIL_SIZE 100

@interface CUTEShareManager () {

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
    [ShareSDK registerApp:@"7e8579931246"];
    [self initializePlat];
}

- (void)initializePlat
{
    /**
     连接微信应用以使用相关功能，此应用需要引用WeChatConnection.framework和微信官方SDK
     http://open.weixin.qq.com上注册应用，并将相关信息填写以下字段
     **/
    [ShareSDK connectWeChatWithAppId:@"wxa8e7919a58064daa"
                           appSecret:@"fbc8a2c56b1bb1f5cbb41c24503cc92b"
                           wechatCls:[WXApi class]];

    /**
     连接新浪微博开放平台应用以使用相关功能，此应用需要引用SinaWeiboConnection.framework
     http://open.weibo.com上注册新浪微博开放平台应用，并将相关信息填写到以下字段
     **/
    [ShareSDK connectSinaWeiboWithAppKey:@"568898243"
                               appSecret:@"38a4f8204cc784f81f9f0daaf31e02e3"
                             redirectUri:@"http://www.sharesdk.cn"];
    
}

- (void)shareToWechatWithTitle:(NSString *)title description:(NSString *)description thumbData:(id)imageData  url:(NSString *)url {

    //        [[CUTEShareManager sharedInstance] shareToWechatWithTitle:[self truncateString:ticket.titleForDisplay length:512] description:[self truncateString:ticket.ticketDescription length:1024] thumbData:result url:[[NSURL URLWithString:CONCAT(@"/wechat-poster/", ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]] absoluteString]];
    id<ISSCAttachment> thumbnail = nil;
    id<ISSCAttachment> sinaImage = nil;
    if ([imageData isKindOfClass:[UIImage class]]) {
        thumbnail = [ShareSDK pngImageWithImage:[(UIImage *)imageData thumbnailImage:THNUMBNAIL_SIZE transparentBorder:0 cornerRadius:0 interpolationQuality:kCGInterpolationDefault]];
        sinaImage = [ShareSDK pngImageWithImage:[(UIImage *)imageData thumbnailImage:THNUMBNAIL_SIZE * 3 transparentBorder:0 cornerRadius:0 interpolationQuality:kCGInterpolationDefault]];
    }
    else if ([imageData isKindOfClass:[NSString class]]) {
        thumbnail = [ShareSDK imageWithUrl:imageData];
        sinaImage = thumbnail;
    }


    id<ISSContent> publishContent = [ShareSDK content:[self truncateString:!IsNilNullOrEmpty(description)? description: title length:140]
                                       defaultContent:nil
                                                image:thumbnail
                                                title:[self truncateString:title length:30]
                                                  url:url
                                          description:[self truncateString:description length:140]
                                            mediaType:SSPublishContentMediaTypeNews];

    [publishContent addSinaWeiboUnitWithContent:[self truncateString:CONCAT(NilNullToEmpty(url), @" ", NilNullToEmpty(title), @" ", NilNullToEmpty(description)) length:140] image:sinaImage];

    [ShareSDK showShareActionSheet:[ShareSDK container]
                         shareList:nil
                           content:publishContent
                     statusBarTips:YES
                       authOptions:nil
                      shareOptions:nil
                            result:^(ShareType type, SSResponseState state, id<ISSPlatformShareInfo> statusInfo, id<ICMErrorInfo> error, BOOL end) {

                                if (state == SSResponseStateBegan) {
                                  

                                }
                                else if (state == SSResponseStateSuccess)
                                {
                                     [SVProgressHUD showSuccessWithStatus:STR(@"分享成功")];
                                }
                                else if (state == SSResponseStateFail)
                                {
                                    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"分享失败"
                                                                                    message:[NSString stringWithFormat:@"失败描述：%@",[error errorDescription]]
                                                                                   delegate:self
                                                                          cancelButtonTitle:@"OK"
                                                                          otherButtonTitles:nil, nil];
                                    [alert show];
                                }
                            }];

}


- (void)shareToWechatWithTicket:(CUTETicket *)ticket {
    Sequencer *sequencer = [Sequencer new];
    NSString *imageURL = IsArrayNilOrEmpty(ticket.property.realityImages)? nil : ticket.property.realityImages.firstObject;
    if (imageURL && [NSURL URLWithString:imageURL].isAssetURL) {
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [SVProgressHUD showWithStatus:STR(@"获取房产中...")];
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
                            ALAsset *asset = task.result;
                            UIImage *image = [UIImage imageWithCGImage:asset.defaultRepresentation.fullScreenImage? : asset.thumbnail];
                            if (!image) {
                                image = [UIImage appIcon];
                            }
                            dispatch_async(dispatch_get_main_queue(), ^(void) {
                                completion(image);
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
//            [SVProgressHUD showWithStatus:STR(@"获取房产中...")];
//
//            [[[CUTEAPIManager sharedInstance] downloadImage:imageURL] continueWithBlock:^id(BFTask *task) {
//                if (task.error) {
//                    [SVProgressHUD showErrorWithError:task.error];
//                }
//                else if (task.exception) {
//                    [SVProgressHUD showErrorWithException:task.exception];
//                }
//                else if (task.isCancelled) {
//                    [SVProgressHUD showErrorWithCancellation];
//                }
//                else {
//                    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^(void){
//                        UIImage *image = task.result;
//                        image = [image resizedImage:THNUMBNAIL_SIZE interpolationQuality:kCGInterpolationDefault];
//                        dispatch_async(dispatch_get_main_queue(), ^(void) {
//                            completion(UIImagePNGRepresentation(image));
//                            [SVProgressHUD dismiss];
//                        });
//                    });
//                }
//
//                return task;
//            }];

            completion(imageURL);
        }];
    }
    else {
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [SVProgressHUD show];
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^(void){
                UIImage *image = [UIImage appIcon];
                dispatch_async(dispatch_get_main_queue(), ^(void) {
                    completion(image);
                    [SVProgressHUD dismiss];
                });
            });
        }];
    }

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[CUTEShareManager sharedInstance] shareToWechatWithTitle:ticket.titleForDisplay description:ticket.ticketDescription thumbData:result url:[[NSURL URLWithString:CONCAT(@"/wechat-poster/", ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]] absoluteString]];
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

- (BOOL)handleOpenURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
    return [ShareSDK handleOpenURL:url sourceApplication:sourceApplication annotation:annotation wxDelegate:self];
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
    if (self.responseBlock) {
        self.responseBlock(resp);
    }
}


@end
