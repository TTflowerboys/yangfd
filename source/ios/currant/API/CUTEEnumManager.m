//
//  CUTEEnumManager.m
//  currant
//
//  Created by Foster Yin on 4/6/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEEnumManager.h"
#import "CUTEEnum.h"
#import <BBTCommonMacro.h>
#import <NSArray+ObjectiveSugar.h>
#import "CUTEAPIManager.h"

@interface CUTEEnumManager () {

    NSMutableDictionary *_enumCache;
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
    }
    return self;
}

- (BFTask *)getEnumsByType:(NSString *)type {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    if ([_enumCache objectForKey:type]) {
        [tcs setResult:[_enumCache objectForKey:type]];
    }
    else {
        [[[CUTEAPIManager sharedInstance] GET:@"/api/1/enum/search" parameters:@{@"type": type} resultClass:[CUTEEnum class]] continueWithSuccessBlock:^id(BFTask *task) {
            if (task.result && !IsArrayNilOrEmpty(task.result)) {
                [_enumCache setValue:task.result forKey:type];
                [tcs setResult:task.result];
            }
            else {
                [tcs setError:task.error];
            }
            return nil;
        }];
    }
    return tcs.task;
}

- (BFTask *)getCountries {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    [tcs setResult:@[
                     @{@"name": STR(@"英国"), @"code": @"GB"},
                     @{@"name": STR(@"中国"), @"code": @"CN"},
                     @{@"name": STR(@"香港"), @"code": @"HK"},
                     @{@"name": STR(@"美国"), @"code": @"US"}]];
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
               @"rent_period",
               @"community_facility"]
             map:^id(id object) {
                 return [self getEnumsByType:object];
             }]];
}

@end
