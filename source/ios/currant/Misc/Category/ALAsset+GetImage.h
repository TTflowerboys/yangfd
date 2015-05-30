//
//  ALAsset+GetImage.h
//  currant
//
//  For details, see http://mindsea.com/2012/12/18/downscaling-huge-alassets-without-fear-of-sigkill
//  Created by Foster Yin on 5/12/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <AssetsLibrary/AssetsLibrary.h>
#import <UIKit/UIKit.h>

@interface ALAsset (GetImage)

- (UIImage *)thumbnailForWithMaxPixelSize:(NSUInteger)size;


@end
