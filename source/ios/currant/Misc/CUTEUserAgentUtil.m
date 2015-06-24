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
    NSArray *userAgentComponents =  @[[[NSBundle mainBundle] bundleIdentifier], [CUTEConfiguration versionBuild]];
    NSDictionary *dictionary = [NSDictionary dictionaryWithObjectsAndKeys:[userAgentComponents componentsJoinedByString:@"/"], @"UserAgent", nil];
    [[NSUserDefaults standardUserDefaults] registerDefaults:dictionary];
}

@end
