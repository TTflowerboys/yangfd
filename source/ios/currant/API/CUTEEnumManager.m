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
#import "CUTECity.h"
#import "CUTECountry.h"

@interface CUTEEnumManager () {

    NSMutableDictionary *_enumCache;

    NSMutableDictionary *_cityCache;
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
        _cityCache = [NSMutableDictionary dictionary];
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
    NSArray *rawArray = @[@{@"name": STR(@"英国"), @"code": @"GB"},
                          @{@"name": STR(@"中国"), @"code": @"CN"},
                          @{@"name": STR(@"香港"), @"code": @"HK"},
                          @{@"name": STR(@"美国"), @"code": @"US"}];
    [tcs setResult:[rawArray map:^id(id object) {
        return [CUTECountry modelWithDictionary:object error:nil];
    }]];
    return tcs.task;
}

- (BFTask *)getCitiesByCountry:(CUTECountry *)country {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];

    if ([_cityCache objectForKey:country.code]) {
        [tcs setResult:[_cityCache objectForKey:country.code]];
    }
    else {
        [[[CUTEAPIManager sharedInstance] GET:@"/api/1/geonames/search" parameters:@{@"country": country.code, @"feature_code": @"city"} resultClass:[CUTECity class]] continueWithBlock:^id(BFTask *task) {
            if (task.error) {
                [tcs setError:task.error];
            }
            else if (task.exception) {
                [tcs setError:task.error];
            }
            else if (task.isCancelled) {
                [tcs setError:task.error];
            }
            else {
                NSArray *cities = task.result;
                cities = [cities sortBy:@"name"];
                [_cityCache setObject:cities forKey:country.code];
                [tcs setResult:cities];
            }

            return task;
        }];
    }
    return tcs.task;
}

- (BFTask *)startLoadAllEnums {
    BFTask *enumTask = [BFTask taskForCompletionOfAllTasks:
            [@[@"property_type",
               @"deposit_type",
               @"indoor_facility",
               @"region_highlight",
               @"rent_type",
               @"rent_period",
               @"community_facility"]
             map:^id(id object) {
                 return [self getEnumsByType:object];
             }]];

    BFTask *cityTask = [[self getCountries] continueWithBlock:^id(BFTask *task) {
        return [BFTask taskForCompletionOfAllTasks:[task.result map:^id(CUTECountry *object) {
            return [self getCitiesByCountry:object];
        }]];
    }];

    return [BFTask taskForCompletionOfAllTasks:@[enumTask, cityTask]];
}

@end
