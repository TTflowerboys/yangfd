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

@implementation UIImageView (Assets)

- (void)setImageWithAssetURL:(NSURL *)url {
    if ([url isAssetURL]) {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^(void) {
            [[[AssetsLibraryProvider sharedInstance] assetsLibrary] assetForURL:url resultBlock:^(ALAsset *asset) {
                UIImage *image = [UIImage imageWithCGImage:asset.defaultRepresentation.fullResolutionImage];
                dispatch_async(dispatch_get_main_queue(), ^(void)
                               {
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
