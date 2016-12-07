//
//  UIImageView+HTTP.m
//  currant
//
//  Created by Foster Yin on 07/12/2016.
//  Copyright © 2016 BBTechgroup. All rights reserved.
//

#import "UIImageView+HTTP.h"
#import <UIImageView+WebCache.h>

@implementation UIImageView (HTTP)

- (void)HTTP_setImageWithURL:(NSURL *)url {
    [self sd_setImageWithURL:url];
}

@end
