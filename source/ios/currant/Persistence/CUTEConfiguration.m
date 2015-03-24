//
//  CUTEConfiguration.m
//  currant
//
//  Created by Foster Yin on 3/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEConfiguration.h"

@implementation CUTEConfiguration

+ (NSString *)host {
    return @"localhost";
}

+ (NSURL *)hostURL {
    return [NSURL URLWithString:CONCAT(@"http://", [self host], @":8181")];
}

+ (NSString *)servicePhone {
    return @"4000926433";
}

@end
