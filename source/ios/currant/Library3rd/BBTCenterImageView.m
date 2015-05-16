//
//  BBTCenterImageView.m
//  currant
//
//  Created by Foster Yin on 5/16/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "BBTCenterImageView.h"
#import <BBTUIMacro.h>

@implementation BBTCenterImageView

- (instancetype)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        _imageView = [[UIImageView alloc] initWithFrame:frame];
        [self addSubview:_imageView];

    }
    return self;
}

- (void)layoutSubviews {
    [super layoutSubviews];
    CGSize imageSize = _imageView.image.size;
    _imageView.frame = CGRectMake(RectWidthExclude(self.bounds, imageSize.width)/ 2, RectHeightExclude(self.bounds, imageSize.height) / 2, imageSize.width, imageSize.height);

}

@end
