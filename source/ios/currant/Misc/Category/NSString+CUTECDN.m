//
//  NSString+CUTECDN.m
//  currant
//
//  Created by Foster Yin on 6/13/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "NSString+CUTECDN.h"
#import "CUTEEnumManager.h"
#import "CUTECommonMacro.h"

@implementation NSString (CUTECDN)

- (NSURL *)getUniformHostCDNURL:(NSURL *)url {
    NSArray *uploadCDNDomains = [CUTEEnumManager sharedInstance].uploadCDNDomains;
    if ([uploadCDNDomains containsObject:url.host]) {
        NSURLComponents *components = [NSURLComponents componentsWithURL:url resolvingAgainstBaseURL:YES];
        components.host = @"upload.yangfd.com";
        url = components.URL;
    }
    return url;
}

- (BOOL)isCDNPathEqualToCDNPath:(NSString *)aCDNPath {
    if (IsArrayNilOrEmpty([CUTEEnumManager sharedInstance].uploadCDNDomains)) {
        [[CUTEEnumManager sharedInstance] getUploadCDNDomains];
    }
    BOOL stringCompare = [self isEqualToString:aCDNPath];
    if (stringCompare) {
        return YES;
    }
    else if (!IsArrayNilOrEmpty([CUTEEnumManager sharedInstance].uploadCDNDomains)) {
        NSURL *url = [self getUniformHostCDNURL:[NSURL URLWithString:self]];
        NSURL *aUrl = [self getUniformHostCDNURL:[NSURL URLWithString:aCDNPath]];
        return [url.absoluteString isEqualToString:aUrl.absoluteString];
    }
    else {
        NSURL *url = [NSURL URLWithString:self];
        NSURL *aUrl = [NSURL URLWithString:aCDNPath];
        return [url.path isEqualToString:aUrl.path];
    }
}

@end
