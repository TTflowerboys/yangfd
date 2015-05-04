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


@interface CUTEImageUploader () {

    BBTRestClient *_imageUploader;
}

@end

@implementation CUTEImageUploader

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

- (BFTask *)uploadData:(NSData *)imageData assetURLString:(NSString *)assetURLStr {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    if (imageData) {
        if (!_imageUploader) {
            _imageUploader = [BBTRestClient clientWithBaseURL:[NSURL URLWithString:[CUTEConfiguration apiEndpoint]] account:nil];
        }
        [_imageUploader.operationQueue addOperation: [_imageUploader HTTPRequestOperationWithRequest:[self makeUploadRequestWithURL:[NSURL URLWithString:@"/api/1/upload_image" relativeToURL:[CUTEConfiguration hostURL]] data:imageData] success:^(AFHTTPRequestOperation *operation, id responseObject) {
            NSDictionary *responseDic = (NSDictionary *)responseObject;
            if ([[responseDic objectForKey:@"ret"] integerValue] == 0) {
                NSString *urlStr = responseDic[@"val"][@"url"];
                [tcs setResult:urlStr];
                [[CUTEDataManager sharedInstance] saveImageURLString:urlStr forAssetURLString:assetURLStr];
                [[CUTEDataManager sharedInstance] saveAssetURLString:assetURLStr forImageURLString:urlStr];
            }
            else {
                [tcs setError:[NSError errorWithDomain:responseDic[@"msg"] code:[[responseDic objectForKey:@"ret"] integerValue] userInfo:responseDic]];
            }

        } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
            [tcs setError:error];
        }]];
    }
    else {
        [tcs setResult:nil];
    }
    return tcs.task;

}

- (BFTask *)uploadImageAsset:(ALAsset *)asset {
    NSString *assetURLStr = [[asset valueForProperty:ALAssetPropertyAssetURL] absoluteString];
    if (!IsNilNullOrEmpty(assetURLStr)) {
         NSString *urlStr = [[CUTEDataManager sharedInstance] getImageURLStringForAssetURLString:assetURLStr];
        if (!IsNilNullOrEmpty(urlStr)) {
            return [BFTask taskWithResult:urlStr];
        }
    }
    //Use png data for orientation http://stackoverflow.com/questions/22308921/fix-ios-picture-orientation-after-upload-php
    NSData *imageData = UIImagePNGRepresentation([UIImage imageWithCGImage:[[asset defaultRepresentation] fullResolutionImage]]);

    return [self uploadData:imageData assetURLString:assetURLStr];
}

- (BFTask *)uploadImageWithAssetURLString:(NSString*)assetURLStr {
    if (!IsNilNullOrEmpty(assetURLStr)) {
        NSString *urlStr = [[CUTEDataManager sharedInstance] getImageURLStringForAssetURLString:assetURLStr];
        if (!IsNilNullOrEmpty(urlStr)) {
            return [BFTask taskWithResult:urlStr];
        }
    }
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^(void) {
        [[[AssetsLibraryProvider sharedInstance] assetsLibrary] assetForURL:[NSURL URLWithString:assetURLStr] resultBlock:^(ALAsset *asset) {
            [tcs setResult:asset];
        } failureBlock:^(NSError *error) {
            [tcs setError:error];
        }];
    });
    
    return [[tcs task] continueWithBlock:^id(BFTask *task) {
        if (task.error) {
            return task;
        }
        else {
            //Use png data for orientation http://stackoverflow.com/questions/22308921/fix-ios-picture-orientation-after-upload-php
            NSData *imageData = UIImagePNGRepresentation([UIImage imageWithCGImage:[[task.result defaultRepresentation] fullResolutionImage]]);
            return [self uploadData:imageData assetURLString:assetURLStr];
        }
    }];
}


@end
