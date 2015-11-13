//
//  CUTEImageUploader.m
//  currant
//
//  Created by Foster Yin on 4/17/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEImageUploader.h"
#import <Bolts.h>
#import <BBTRestClient.h>
#import <AssetsLibrary/AssetsLibrary.h>
#import "CUTEConfiguration.h"
#import "CUTEDataManager.h"
#import "CUTECommonMacro.h"
#import "AssetsLibraryProvider.h"
#import <UIImage+Resize.h>
#import "UIImage+FixJPEGRotation.h"
#import "NSURL+Assets.h"
#import <NSArray+ObjectiveSugar.h>
#import "ALAsset+GetImage.h"
#import "UIImage+CalculatedSize.h"
#import "CUTEAPIManager.h"
#import "NSObject+Attachment.h"

@interface CUTEImageUploader () {

    BBTRestClient *_imageUploader;

    NSOperationQueue *_uploadQueue;

    NSMutableDictionary *_requestTaskDictionary;
}

@end

@implementation CUTEImageUploader

+ (instancetype)sharedInstance
{
    static dispatch_once_t pred;
    __strong static id sharedInstance = nil;

    dispatch_once(&pred, ^{
        sharedInstance = [[[self class] alloc] init];
    });

    return sharedInstance;
}


- (instancetype)init
{
    self = [super init];
    if (self) {
        _imageUploader = [BBTRestClient clientWithBaseURL:[NSURL URLWithString:[CUTEConfiguration apiEndpoint]] account:nil];
        _uploadQueue = [NSOperationQueue new];
        _uploadQueue.maxConcurrentOperationCount = 1;
        _requestTaskDictionary = [NSMutableDictionary dictionary];
    }
    return self;
}


//http://stackoverflow.com/questions/8042360/nsdata-and-uploading-images-via-post-in-ios
- (NSURLRequest *)makeUploadRequestWithURL:(NSURL*)url data:(NSData *)imageData {
    // create request
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] init];
    [request setCachePolicy:NSURLRequestReloadIgnoringLocalCacheData];
    [request setHTTPShouldHandleCookies:NO];
    [request setTimeoutInterval:120];
    [request setHTTPMethod:@"POST"];

    NSString *boundary = @"-------CUTEboundary------";
    // set Content-Type in HTTP header
    NSString *contentType = [NSString stringWithFormat:@"multipart/form-data; boundary=%@", boundary];
    [request setValue:contentType forHTTPHeaderField: @"Content-Type"];

    // post body
    NSMutableData *body = [NSMutableData data];

    //http://stackoverflow.com/questions/8564833/ios-upload-image-and-text-using-http-post
    NSDictionary *params = @{@"watermark": @"True"};
    // add params (all params are strings)
    for (NSString *param in params) {
        [body appendData:[[NSString stringWithFormat:@"--%@\r\n", boundary] dataUsingEncoding:NSUTF8StringEncoding]];
        [body appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"\r\n\r\n", param] dataUsingEncoding:NSUTF8StringEncoding]];
        [body appendData:[[NSString stringWithFormat:@"%@\r\n", [params objectForKey:param]] dataUsingEncoding:NSUTF8StringEncoding]];
    }

    if (imageData) {
        [body appendData:[[NSString stringWithFormat:@"--%@\r\n", boundary] dataUsingEncoding:NSUTF8StringEncoding]];
        [body appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"; filename=\"image.jpg\"\r\n", @"data"] dataUsingEncoding:NSUTF8StringEncoding]];
        [body appendData:[@"Content-Type: image/jpeg\r\n\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
        [body appendData:imageData];
        [body appendData:[[NSString stringWithFormat:@"\r\n"] dataUsingEncoding:NSUTF8StringEncoding]];
    }

    [body appendData:[[NSString stringWithFormat:@"--%@--\r\n", boundary] dataUsingEncoding:NSUTF8StringEncoding]];

    // setting the body of the post to the reqeust
    [request setHTTPBody:body];

    // set URL
    [request setURL:url];
    return request;
}

#define MAX_IMAGE_PIXEL 2048

-  (BFTask *)getImageDataWithAssetURLString:(NSString *)assetURLStr {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^(void) {
        [[AssetsLibraryProvider sharedInstance].assetsLibrary assetForURL:[NSURL URLWithString:assetURLStr] resultBlock:^(ALAsset *asset) {
            dispatch_async(dispatch_get_main_queue(), ^(void) {
                UIImage *image = [asset thumbnailForWithMaxPixelSize:MAX_IMAGE_PIXEL];
                image = [image fixJPEGRotation];
                if (image) {
                    //TODO dynamic choose compressionQuality base image file size
                    NSData *imageData = UIImageJPEGRepresentation(image, 1);
                    [tcs setResult:imageData];
                }
                else {
                    [tcs setError:[NSError errorWithDomain:CUTE_ERROR_DOMAIN code:-1 userInfo:@{NSLocalizedDescriptionKey: STR(@"ImageUploader/图片读取失败")}]];
                }
            });
        } failureBlock:^(NSError *error) {
            dispatch_async(dispatch_get_main_queue(), ^(void) {
                [tcs setError:error];
            });
        }];
    });
    return tcs.task;
}

- (BFTask *)uploadImageWithAssetURLString:(NSString*)assetURLStr cancellationToken:(BFCancellationToken *)cancellationToken {
    if (_requestTaskDictionary[assetURLStr]) {
        return [_requestTaskDictionary objectForKey:assetURLStr];
    }

    if (!IsNilNullOrEmpty(assetURLStr)) {
        NSString *urlStr = [[CUTEDataManager sharedInstance] getImageURLStringForAssetURLString:assetURLStr];
        if (!IsNilNullOrEmpty(urlStr)) {
            return [BFTask taskWithResult:urlStr];
        }
    }

    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    [_uploadQueue addOperationWithBlock:^{
        [[self getImageDataWithAssetURLString:assetURLStr] continueWithBlock:^id(BFTask *task) {
            NSData *imageData = task.result;
            if (imageData) {

                AFHTTPRequestOperation *operation = [_imageUploader HTTPRequestOperationWithRequest:[self makeUploadRequestWithURL:[NSURL URLWithString:@"/api/1/upload_image" relativeToURL:[CUTEConfiguration uploadHostURL]] data:imageData] success:^(AFHTTPRequestOperation *operation, id responseObject) {
                    NSDictionary *responseDic = (NSDictionary *)responseObject;
                    if ([[responseDic objectForKey:@"ret"] integerValue] == 0) {
                        NSString *urlStr = responseDic[@"val"][@"url"];
                        [[CUTEDataManager sharedInstance] saveImageURLString:urlStr forAssetURLString:assetURLStr];
                        [[CUTEDataManager sharedInstance] saveAssetURLString:assetURLStr forImageURLString:urlStr];
                        [_requestTaskDictionary removeObjectForKey:assetURLStr];

                        if (!tcs.task.isCancelled) {
                            [tcs setResult:urlStr];
                        }
                    }
                    else {
                        [_requestTaskDictionary removeObjectForKey:assetURLStr];
                        if (!tcs.task.isCancelled) {
                            [tcs setError:[NSError errorWithDomain:responseDic[@"msg"] code:[[responseDic objectForKey:@"ret"] integerValue] userInfo:responseDic]];
                        }
                    }

                } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
                    [_requestTaskDictionary removeObjectForKey:assetURLStr];
                    if (!tcs.task.isCancelled) {
                        [tcs setError:error];
                    }
                }] ;
                tcs.task.attachment = operation;
                [operation start];
            }
            else {
                [_requestTaskDictionary removeObjectForKey:assetURLStr];
                if (!tcs.task.isCancelled) {
                    [tcs setError:task.error];
                }
            }
            
            return nil;
        }];
    }];


    //如果取消，就只是取消反馈给UI，但是图片接着传
    if (cancellationToken) {
        [cancellationToken registerCancellationObserverWithBlock:^{
            [tcs trySetCancelled];
        }];
    }

    [_requestTaskDictionary setObject:tcs.task forKey:assetURLStr];
    return tcs.task;
}

- (BFTask *)getAssetsOrNullsFromURLArray:(NSArray *)array {
    return [BFTask taskForCompletionOfAllTasksWithResults:[array map:^id(NSString *object) {
        return [self getAssetOrNullFromURLString:object];
        }
    ]];
}

- (BFTask *)getAssetOrNullFromURLString:(NSString *)object {
    NSURL *url = [NSURL URLWithString:object];
    if (![url isAssetURL]) {
        NSString *assetString = [[CUTEDataManager sharedInstance] getAssetURLStringForImageURLString:object];
        url = [NSURL URLWithString:assetString];
    }

    if ([url isAssetURL]) {
        BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^(void) {
            [[[AssetsLibraryProvider sharedInstance] assetsLibrary] assetForURL:url resultBlock:^(ALAsset *asset) {
                dispatch_async(dispatch_get_main_queue(), ^(void) {
                    [tcs setResult:asset];
                });
            } failureBlock:^(NSError *error) {
                dispatch_async(dispatch_get_main_queue(), ^(void) {
                    [tcs setError:error];
                });
            }];
        });
        return tcs.task;

    }
    else {
        return [BFTask taskWithResult:[NSNull null]];
    }
}

- (BFTask *)getAssetURLsOrNullsFromURLArray:(NSArray *)array {
    return [BFTask taskForCompletionOfAllTasksWithResults:[array map:^id(NSString *object) {
        return [self getAssetURLOrNullFromURL:object];
    }]];
}

- (BFTask *)getAssetURLOrNullFromURL:(NSString *)object {
    NSURL *url = [NSURL URLWithString:object];
    if (![url isAssetURL]) {
        NSString *assetString = [[CUTEDataManager sharedInstance] getAssetURLStringForImageURLString:object];
        url = [NSURL URLWithString:assetString];
    }

    if ([url isAssetURL]) {
        return [BFTask taskWithResult:url];
    }
    else {
        return [BFTask taskWithResult:[NSNull null]];
    }
}

- (void)cancelTaskForAssetURLString:(NSString *)assetURLStr {
    BFTask *task = [_requestTaskDictionary objectForKey:assetURLStr];
    if (task && task.attachment && [task.attachment isKindOfClass:[AFHTTPRequestOperation class]]) {
        [(AFHTTPRequestOperation *)task.attachment cancel];
        [_requestTaskDictionary removeObjectForKey:assetURLStr];
    }
}

@end
