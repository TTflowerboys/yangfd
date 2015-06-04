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
#import <ShareSDK/ShareSDK.h>


@interface CUTEWxManager () {

}

@property(copy) void (^responseBlock)(BaseResp *);

@end


@implementation CUTEWxManager

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
     连接新浪微博开放平台应用以使用相关功能，此应用需要引用SinaWeiboConnection.framework
     http://open.weibo.com上注册新浪微博开放平台应用，并将相关信息填写到以下字段
     **/
    [ShareSDK connectSinaWeiboWithAppKey:@"568898243"
                               appSecret:@"38a4f8204cc784f81f9f0daaf31e02e3"
                             redirectUri:@"http://www.sharesdk.cn"];

    /**
     连接微信应用以使用相关功能，此应用需要引用WeChatConnection.framework和微信官方SDK
     http://open.weixin.qq.com上注册应用，并将相关信息填写以下字段
     **/
    [ShareSDK connectWeChatWithAppId:@"wxa8e7919a58064daa"
                           appSecret:@"fbc8a2c56b1bb1f5cbb41c24503cc92b"
                           wechatCls:[WXApi class]];
    
}

- (void)shareToWechatWithTitle:(NSString *)title description:(NSString *)description thumbData:(NSData *)imageData  url:(NSString *)url {


    //1、构造分享内容
    id<ISSContent> publishContent = [ShareSDK content:CONCAT(NilNullToEmpty(title), @" ", NilNullToEmpty(description))
                                       defaultContent:description
                                                image:[ShareSDK imageWithData:imageData fileName:nil mimeType:nil]
                                                title:title
                                                  url:url
                                          description:description
                                            mediaType:SSPublishContentMediaTypeNews];
    //1+创建弹出菜单容器（iPad必要）
    id<ISSContainer> container = [ShareSDK container];
    //    [container setIPadContainerWithView:self.view arrowDirect:UIPopoverArrowDirectionUp];

    //2、弹出分享菜单
    [ShareSDK showShareActionSheet:container
                         shareList:nil
                           content:publishContent
                     statusBarTips:YES
                       authOptions:nil
                      shareOptions:nil
                            result:^(ShareType type, SSResponseState state, id<ISSPlatformShareInfo> statusInfo, id<ICMErrorInfo> error, BOOL end) {

                                //可以根据回调提示用户。
                                if (state == SSResponseStateSuccess)
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

#define THNUMBNAIL_SIZE CGSizeMake(100, 100)

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
            [SVProgressHUD showWithStatus:STR(@"获取房产中...")];

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
