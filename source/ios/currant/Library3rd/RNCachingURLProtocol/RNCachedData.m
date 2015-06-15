//
//  RNCachedData.m
//  currant
//
//  Created by Foster Yin on 6/15/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "RNCachedData.h"
#import "EGOCache.h"
#import "NSString+Sha1.h"
#import "RegExCategories.h"
#import "NSArray+ObjectiveSugar.h"


static NSString *const kDataKey = @"data";
static NSString *const kResponseKey = @"response";
static NSString *const kRedirectRequestKey = @"redirectRequest";

@implementation RNCachedData
@synthesize data = data_;
@synthesize response = response_;
@synthesize redirectRequest = redirectRequest_;

- (void)encodeWithCoder:(NSCoder *)aCoder
{
    [aCoder encodeObject:[self data] forKey:kDataKey];
    [aCoder encodeObject:[self response] forKey:kResponseKey];
    [aCoder encodeObject:[self redirectRequest] forKey:kRedirectRequestKey];
}

- (id)initWithCoder:(NSCoder *)aDecoder
{
    self = [super init];
    if (self != nil) {
        [self setData:[aDecoder decodeObjectForKey:kDataKey]];
        [self setResponse:[aDecoder decodeObjectForKey:kResponseKey]];
        [self setRedirectRequest:[aDecoder decodeObjectForKey:kRedirectRequestKey]];
    }

    return self;
}

static NSArray *_hostList;
static NSArray *_exceptionRules;

+ (void)setHostList:(NSArray *)hostList {
    _hostList = hostList;
}

+ (void)setExceptionRules:(NSArray *)exceptionRules {
    _exceptionRules = exceptionRules;
}

+ (BOOL)isRequestPassRules:(NSURLRequest *)request {
    NSString *host = request.URL.host;
    NSString *urlStr = request.URL.absoluteString;
    if ([_hostList containsObject:host]) {
        id ret =  [_exceptionRules detect:^BOOL(NSString *object) {
            return [urlStr isMatch:[object toRx]];
        }];
        return ret == nil;
    }
    return NO;
}

+ (void)setDefaultTimeoutInterval:(NSTimeInterval)timeoutInterval {
    [[EGOCache globalCache] setDefaultTimeoutInterval:timeoutInterval];
}

+ (NSString *)keyForRequest:(NSURLRequest *)aRequest
{
    NSString *fileName = [[[aRequest URL] absoluteString] sha1];
    return fileName;
}

+ (BOOL)isRequestCached:(NSURLRequest *)request {
    if (![[self class] isRequestPassRules:request]) {
        return NO;
    }
    return [[[EGOCache globalCache] allKeys] containsObject:[self keyForRequest:request]];
}

+ (RNCachedData *)getCacheForRequest:(NSURLRequest *)request {
    if (![[self class] isRequestPassRules:request]) {
        return nil;
    }
    return (RNCachedData *)[[EGOCache globalCache] objectForKey:[self keyForRequest:request]];
}

+ (void)saveCache:(RNCachedData *)cache forRequest:(NSURLRequest *)request {
    if (![[self class] isRequestPassRules:request]) {
        return;
    }

    if (cache && cache.response) {
        [[EGOCache globalCache] setObject:cache forKey:[self keyForRequest:request]];
    }
}


@end

