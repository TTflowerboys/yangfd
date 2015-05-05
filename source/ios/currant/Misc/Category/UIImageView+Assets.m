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
        [[[AssetsLibraryProvider sharedInstance] assetsLibrary] assetForURL:url resultBlock:^(ALAsset *asset) {
            UIImage *image = [UIImage imageWithCGImage:asset.defaultRepresentation.fullResolutionImage];
            [self setImage:image];
        } failureBlock:^(NSError *error) {

        }];
    }
    else {
        [self setImageWithURL:url];
    }
}

@end
