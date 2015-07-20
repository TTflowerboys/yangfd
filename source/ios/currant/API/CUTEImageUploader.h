//
//  CUTEImageUploader.h
//  currant
//
//  Created by Foster Yin on 4/17/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <BFTask.h>
#import <AssetsLibrary/AssetsLibrary.h>

@interface CUTEImageUploader : NSObject

//upload image take long time, so use this shareInstance is better
+ (instancetype)sharedInstance;

- (BFTask *)uploadImageWithAssetURLString:(NSString*)assetURLStr;

- (BFTask *)getAssetsOrNullsFromURLArray:(NSArray *)array;

- (BFTask *)getAssetOrNullFromURL:(NSString *)object;

- (BFTask *)getAssetURLsOrNullsFromURLArray:(NSArray *)array;

- (void)cancelTaskForAssetURLString:(NSString *)assetURLStr;

@end
