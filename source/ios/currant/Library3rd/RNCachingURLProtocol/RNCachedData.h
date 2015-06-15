//
//  RNCachedData.h
//  currant
//
//  Created by Foster Yin on 6/15/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>


@interface RNCachedData : NSObject <NSCoding>

@property (nonatomic, readwrite, strong) NSData *data;

@property (nonatomic, readwrite, strong) NSURLResponse *response;

@property (nonatomic, readwrite, strong) NSURLRequest *redirectRequest;


+ (void)setHostList:(NSArray *)hostList; // host array

+ (void)setExceptionRules:(NSArray *)exceptionRules; //regex

+ (void)setDefaultTimeoutInterval:(NSTimeInterval)timeoutInterval;

+ (BOOL)isRequestCached:(NSURLRequest *)request;

+ (RNCachedData *)getCacheForRequest:(NSURLRequest *)request;

+ (void)saveCache:(RNCachedData *)cache forRequest:(NSURLRequest *)request;

@end