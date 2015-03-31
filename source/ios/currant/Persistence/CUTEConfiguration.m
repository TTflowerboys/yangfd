//
//  CUTEConfiguration.m
//  currant
//
//  Created by Foster Yin on 3/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEConfiguration.h"

@implementation CUTEConfiguration

static NSString *host = nil;
+ (NSString *)host {
    if (!host) {
        host = [[[NSBundle mainBundle] objectForInfoDictionaryKey: @"CurrantHost"] copy];
    }
    return host;
}

+ (NSURL *)hostURL {
    if  ([[self host] isEqualToString:@"localhost"]) {
        return [NSURL URLWithString:CONCAT(@"http://", [self host], @":8181")];
    }
    else {
        return [NSURL URLWithString:CONCAT(@"http://", [self host])];
    }
}

+ (NSString *)yangfdScheme {
    return @"yangfd";
}


+ (NSString *)servicePhone {
    return @"4000926433";
}

@end
