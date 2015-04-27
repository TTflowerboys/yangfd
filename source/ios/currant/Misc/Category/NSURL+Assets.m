//
//  NSURL+Assets.m
//  currant
//
//  Created by Foster Yin on 4/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "NSURL+Assets.h"

@implementation NSURL (Assets)

- (BOOL)isAssetURL {
    return [self.scheme isEqualToString:@"assets-library"];
}

@end
