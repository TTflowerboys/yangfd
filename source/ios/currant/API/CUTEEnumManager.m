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
#import <NSArray+Frankenstein.h>

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

- (BFTask *)getEnumsByType:(NSString *)type {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    if ([_enumCache objectForKey:type]) {
        [tcs setResult:[_enumCache objectForKey:type]];
    }
    else {
        [_backingManager GET:@"/api/1/enum/search" parameters:@{@"type": type} resultClass:[CUTEEnum class] completion:^(AFHTTPRequestOperation *operation, id responseObject, NSError *error) {
            if (responseObject && [responseObject isKindOfClass:[NSArray class]] && !IsArrayNilOrEmpty(responseObject)) {
                [_enumCache setValue:responseObject forKey:type];
                [tcs setResult:responseObject];
            }
            else {
                [tcs setError:error];
            }
        }];
    }
    return tcs.task;
}

- (BFTask *)startLoadAllEnums {
    return [BFTask taskForCompletionOfAllTasks:
            [@[@"country",
               @"city",
               @"property_type",
               @"deposit_type",
               @"indoor_facility",
               @"region_highlight",
               @"rent_type",
               @"rent_period"]
             map:^id(id object) {
                 return [self getEnumsByType:object];
             }]];
}

@end
