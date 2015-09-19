//
//  CUTEUserAgentUtil.m
//  currant
//
//  Created by Foster Yin on 6/23/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEUserAgentUtil.h"
#import "CUTEConfiguration.h"
#import <UIKit/UIKit.h>

@implementation CUTEUserAgentUtil

+ (void)setupWebViewUserAgent {
    NSDictionary *dictionary = [NSDictionary dictionaryWithObjectsAndKeys:[CUTEUserAgentUtil userAgent], @"UserAgent", nil];
    [[NSUserDefaults standardUserDefaults] registerDefaults:dictionary];
}

//Reference from https://github.com/AFNetworking/AFNetworking/blob/master/AFNetworking/AFURLRequestSerialization.m
+ (NSString *)userAgent {

    NSString *userAgent = nil;
    userAgent = [NSString stringWithFormat:@"%@/%@ (%@; iOS %@; Scale/%0.2f)", @"currant",
                 [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"] ?: [[[NSBundle mainBundle] infoDictionary] objectForKey:(__bridge NSString *)kCFBundleVersionKey],
                 [[UIDevice currentDevice] model], [[UIDevice currentDevice] systemVersion],
                 [[UIScreen mainScreen] scale]];

#pragma clang diagnostic pop
    if (userAgent) {
        if (![userAgent canBeConvertedToEncoding:NSASCIIStringEncoding]) {
            NSMutableString *mutableUserAgent = [userAgent mutableCopy];
            if (CFStringTransform((__bridge CFMutableStringRef)(mutableUserAgent), NULL, (__bridge CFStringRef)@"Any-Latin; Latin-ASCII; [:^ASCII:] Remove", false)) {
                userAgent = mutableUserAgent;
            }
        }
    }

    return userAgent;
}

@end
