//
//  UIImageView+PropertyImageURLString.h
//  currant
//
//  Created by Foster Yin on 4/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UIImageView (Assets)

//- (void)setImageWithAssetURL:(NSURL *)url;

- (void)setImageWithAssetURL:(NSURL *)url thumbnail:(BOOL)thumbnail;

- (void)setImageWithAssetURL:(NSURL *)url thumbnailSize:(CGSize)thumbnailSize;

- (void)setImageWithAssetURL:(NSURL *)url thumbnailWidth:(CGFloat)thumbnailWidth;

@end

