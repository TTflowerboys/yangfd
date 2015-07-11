//
//  CUTEUserAgentUtil.m
//  currant
//
//  Created by Foster Yin on 6/23/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEUserAgentUtil.h"
#import "CUTEConfiguration.h"

@implementation CUTEUserAgentUtil

+ (void)setupUserAgent {
    NSDictionary *dictionary = [NSDictionary dictionaryWithObjectsAndKeys:[CUTEUserAgentUtil userAgent], @"UserAgent", nil];
    [[NSUserDefaults standardUserDefaults] registerDefaults:dictionary];
}

+ (NSString *)userAgent {
    NSArray *userAgentComponents =  @[[[NSBundle mainBundle] bundleIdentifier], [CUTEConfiguration versionBuild]];
    return [userAgentComponents componentsJoinedByString:@"/"];

}

@end
