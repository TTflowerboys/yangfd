//
//  CUTEEnumManager.m
//  currant
//
//  Created by Foster Yin on 4/6/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEEnumManager.h"
#import <BBTRestClient.h>
#import "CUTEConfiguration.h"
#import "CUTEEnum.h"
#import <BBTCommonMacro.h>

@interface CUTEEnumManager () {
    NSMutableDictionary *_enumCache;

    BBTRestClient *_backingManager;

}

@end

@implementation CUTEEnumManager

+ (instancetype)sharedInstance
{
    static dispatch_once_t pred;
    __strong static id sharedInstance = nil;

    dispatch_once(&pred, ^{
        sharedInstance = [[[self class] alloc] init];
    });

    return sharedInstance;
}

- (instancetype)init
{
    self = [super init];
    if (self) {
        _enumCache = [NSMutableDictionary dictionary];
        _backingManager = [BBTRestClient clientWithBaseURL:[NSURL URLWithString:[CUTEConfiguration apiEndpoint]] account:nil];
    }
    return self;
}

- (AFHTTPRequestOperation *)getEnumByType:(NSString *)type completion:(dispatch_block_t)comletion {
    return [_backingManager POST:@"/api/1/enum/search" parameters:@{@"type": type} resultClass:[CUTEEnum class] completion:^(AFHTTPRequestOperation *operation, id responseObject, NSError *error) {

 }];
}

- (void)startLoadAllEnums {
    AFHTTPRequestOperation *operation =  [self getEnumByType:@"country" completion:nil];
}



@end
