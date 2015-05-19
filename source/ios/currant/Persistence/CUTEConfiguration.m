//
//  CUTEConfiguration.m
//  currant
//
//  Created by Foster Yin on 3/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEConfiguration.h"
#import "CUTECommonMacro.h"

@implementation CUTEConfiguration

static NSString *host = nil;
+ (NSString *)host {
    if (!host) {
        host = [[[NSBundle mainBundle] objectForInfoDictionaryKey: @"CurrantHost"] copy];
    }
    return host;
}

+ (NSURL *)hostURL {
    return [NSURL URLWithString:CONCAT(@"http://", [self host])];
}

+ (NSString *)yangfdScheme {
    return @"yangfd";
}

+ (NSString *)ukServicePhone {
    return @"02030402258";
}

+ (NSString *)servicePhone {
    return @"4000926433";
}

+ (NSString *)apiEndpoint {
    return CONCAT(@"http://", [self host], @"/api/1/");
}

+ (NSString *)googleAPIKey {
    return @"AIzaSyCXOb8EoLnYOCsxIFRV-7kTIFsX32cYpYU";
}

+ (NSString *)weixinAPPId {
    return @"wxa8e7919a58064daa";
}

+ (NSString *)gaTrackingId {
    return @"UA-55542465-2";
}

@end
