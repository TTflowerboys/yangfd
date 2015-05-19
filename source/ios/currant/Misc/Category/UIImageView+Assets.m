//
//  UIImageView+PropertyImageURLString.m
//  currant
//
//  Created by Foster Yin on 4/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "UIImageView+Assets.h"
#import <UIImageView+AFNetworking.h>
#import "AssetsLibraryProvider.h"
#import "NSURL+Assets.h"
#import <UIImage+Resize.h>
#import <UIImage+BBT.h>
#import "CUTECommonMacro.h"

@implementation UIImageView (Assets)

- (void)setImageWithAssetURL:(NSURL *)url thumbnail:(BOOL)thumbnail failureBlock:(ALAssetsLibraryAccessFailureBlock)failureBlock  {
    if ([url isAssetURL]) {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^(void) {
            [[[AssetsLibraryProvider sharedInstance] assetsLibrary] assetForURL:url resultBlock:^(ALAsset *asset) {
                UIImage *image = [UIImage imageWithCGImage:thumbnail? asset.thumbnail: asset.defaultRepresentation.fullScreenImage];

                dispatch_async(dispatch_get_main_queue(), ^(void) {
                    if (image) {
                        [self setImage:image];
                    }
                    else {
                        if (failureBlock) {
                            failureBlock([NSError errorWithDomain:@"CUTE" code:-1 userInfo:@{NSLocalizedDescriptionKey: STR(@"图片读取失败")}]);
                        }
                    }
                });
            } failureBlock:^(NSError *error) {
                if (failureBlock) {
                    dispatch_async(dispatch_get_main_queue(), ^(void) {
                        failureBlock(error);
                    });
                }
            }];
        });

    }
    else {
        [self setImageWithURL:url];
    }
}

- (void)setImageWithAssetURL:(NSURL *)url thumbnailSize:(CGSize)thumbnailSize {
    if ([url isAssetURL]) {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^(void) {
            [[[AssetsLibraryProvider sharedInstance] assetsLibrary] assetForURL:url resultBlock:^(ALAsset *asset) {
                UIImage *image = [[UIImage imageWithCGImage:asset.defaultRepresentation.fullScreenImage] resizedImage:thumbnailSize interpolationQuality:kCGInterpolationDefault];
                dispatch_async(dispatch_get_main_queue(), ^(void) {
                    [self setImage:image];
                });
            } failureBlock:^(NSError *error) {

            }];
        });

    }
    else {
        [self setImageWithURL:url];
    }
}

- (void)setImageWithAssetURL:(NSURL *)url thumbnailWidth:(CGFloat)thumbnailWidth {
    if ([url isAssetURL]) {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^(void) {
            [[[AssetsLibraryProvider sharedInstance] assetsLibrary] assetForURL:url resultBlock:^(ALAsset *asset) {

                UIImage *image = [UIImage imageWithCGImage:asset.defaultRepresentation.fullScreenImage];
                CGSize imageSize = image.size;
                if (imageSize.width > 0) {
                    image = [image resizedImage:CGSizeMake(thumbnailWidth, (thumbnailWidth / imageSize.width) * imageSize.height) interpolationQuality:kCGInterpolationDefault];
                }
                else {
                    image = nil;
                }
                dispatch_async(dispatch_get_main_queue(), ^(void) {
                    [self setImage:image];
                });
            } failureBlock:^(NSError *error) {

            }];
        });

    }
    else {
        [self setImageWithURL:url];
    }
}

@end
