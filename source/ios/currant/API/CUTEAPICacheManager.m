//
//  CUTEEnumManager.m
//  currant
//
//  Created by Foster Yin on 4/6/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEAPICacheManager.h"
#import "CUTEEnum.h"
#import <BBTCommonMacro.h>
#import <NSArray+ObjectiveSugar.h>
#import "CUTEAPIManager.h"
#import "CUTECity.h"
#import "CUTECountry.h"
#import "CUTENeighborhood.h"
#import "EGOCache.h"

NSString * const CUTEAPICacheEnumKeyPrefix = @"Enum ";

NSString * const CUTEAPICacheCityKeyPrefix = @"City ";

NSString * const CUTEAPICacheNeighborhoodKeyPrefix = @"Neighborhood ";

NSString * const CUTEAPICacheCDNDomainsKey = @"CDN Domains";

@interface CUTEAPICacheManager () {

    EGOCache *_cache;

}

@end

@implementation CUTEAPICacheManager

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
        NSString* cachesDirectory = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES)[0];
        cachesDirectory = [[[cachesDirectory stringByAppendingPathComponent:[[NSBundle mainBundle] bundleIdentifier]] stringByAppendingPathComponent:@"APICache"] copy];
        _cache = [[EGOCache alloc] initWithCacheDirectory:cachesDirectory];
    }
    return self;
}

- (NSArray *)uploadCDNDomains {
    id<NSCoding> cacheObject = [_cache objectForKey:CUTEAPICacheCDNDomainsKey];
    if (cacheObject && [(NSObject *)cacheObject isKindOfClass:[NSArray class]]) {
        return (NSArray *)cacheObject;
    }
    return nil;
}

- (BFTask *)getEnumsByTypeIgnoringCache:(NSString *)type cancellationToken:(BFCancellationToken *)cancellationToken {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    [[[CUTEAPIManager sharedInstance] GET:@"/api/1/enum/search" parameters:@{@"type": type, @"sort": [NSNumber numberWithBool:YES]} resultClass:[CUTEEnum class] cancellationToken:cancellationToken] continueWithSuccessBlock:^id(BFTask *task) {
        NSArray *result = task.result;
        if (result && !IsArrayNilOrEmpty(result)) {
            [_cache setObject:result forKey:CONCAT(CUTEAPICacheEnumKeyPrefix, type)];
            [tcs setResult:result];
        }
        else {
            [tcs setError:task.error];
        }
        return nil;
    }];
    return tcs.task;
}

- (BFTask *)getEnumsByType:(NSString *)type cancellationToken:(BFCancellationToken *)cancellationToken {

    id cacheObject = [_cache objectForKey:CONCAT(CUTEAPICacheEnumKeyPrefix, type)];
    if (cacheObject && [cacheObject isKindOfClass:[NSArray class]]) {
        return [BFTask taskWithResult:cacheObject];
    }
    else {
        return [self getEnumsByTypeIgnoringCache:type cancellationToken:cancellationToken];
    }
}

- (BFTask *)getCountriesWithCountryCode:(BOOL)showCountryCode {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    NSArray *rawArray = @[@{@"code": @"GB"},
                          @{@"code": @"CN"},
                          @{@"code": @"US"}];
    [tcs setResult:[rawArray map:^id(id object) {
        CUTECountry *country = (CUTECountry *)[[[MTLJSONAdapter alloc] initWithJSONDictionary:object modelClass:[CUTECountry class] error:nil] model];
        country.showCountryCode =showCountryCode;
        return country;
    }]];
    return tcs.task;
}

- (BFTask *)getCitiesByCountryIgnoringCache:(CUTECountry *)country {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];

    [[[CUTEAPIManager sharedInstance] GET:@"/api/1/geonames/search" parameters:@{@"country": country.ISOcountryCode, @"feature_code": @"city"} resultClass:[CUTECity class]] continueWithBlock:^id(BFTask *task) {
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
            cities = [cities sortBy:@"fieldDescription"];
            [_cache setObject:cities forKey:CONCAT(CUTEAPICacheCityKeyPrefix, country.ISOcountryCode)];
            [tcs setResult:cities];
        }

        return task;
    }];
    return tcs.task;
}


- (BFTask *)getCitiesByCountry:(CUTECountry *)country {
    if (IsNilOrNull(country)) {
        return [BFTask taskWithResult:nil];
    }
    id cacheObject = [_cache objectForKey:CONCAT(CUTEAPICacheCityKeyPrefix, country.ISOcountryCode)];
    if (cacheObject && [cacheObject isKindOfClass:[NSArray class]]) {
        return [BFTask taskWithResult:cacheObject];

    }
    else {
        return [self getCitiesByCountryIgnoringCache:country];
    }
}

//TODO update neighborhood cache

- (BFTask *)getNeighborhoodByCityIgnoringCache:(CUTECity *)city {

    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];

    [[[CUTEAPIManager sharedInstance] GET:@"/api/1/maponics_neighborhood/search" parameters:@{@"city": city.identifier, @"include_parent": @"True"} resultClass:[CUTENeighborhood class]] continueWithBlock:^id(BFTask *task) {
        if (task.error) {
            [tcs setError:task.error];
        }
        else if (task.exception) {
            [tcs setException:task.exception];
        }
        else if (task.isCancelled) {
            [tcs cancel];
        }
        else {
            if (!IsArrayNilOrEmpty(task.result)) {
                NSArray *neighborhoods = task.result;
                neighborhoods = [neighborhoods sortBy:@"fieldDescription"];
                [_cache setObject:neighborhoods forKey:CONCAT(CUTEAPICacheNeighborhoodKeyPrefix, city.identifier)];
                [tcs setResult:neighborhoods];
            }
            else {
                [tcs setResult:task.result];
            }
        }
        return task;
    }];

    return tcs.task;
}

- (BFTask *)getNeighborhoodByCity:(CUTECity *)city {
    if (IsNilOrNull(city)) {
        return [BFTask taskWithResult:nil];
    }
    id cacheObject = [_cache objectForKey:CONCAT(CUTEAPICacheNeighborhoodKeyPrefix, city.identifier)];
    if (cacheObject && [cacheObject isKindOfClass:[NSArray class]]) {
        return [BFTask taskWithResult:cacheObject];
    }
    else {
        return [self getNeighborhoodByCityIgnoringCache:city];
    }
}


- (BFTask *)getUploadCDNDomainsIgnoringCache {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    [[[CUTEAPIManager sharedInstance] GET:@"/api/1/upload-cdn-domains" parameters:nil resultClass:nil] continueWithBlock:^id(BFTask *task) {
        if (task.error) {
            [tcs setError:task.error];
        }
        else if (task.exception) {
            [tcs setException:task.exception];
        }
        else if (task.isCancelled) {
            [tcs cancel];
        }
        else {
            [_cache setObject:task.result forKey:CUTEAPICacheCDNDomainsKey];
            [tcs setResult:task.result];
        }

        return task;
    }];
    return tcs.task;
}

- (BFTask *)getUploadCDNDomains {

    id cacheObject = [_cache objectForKey:CUTEAPICacheCDNDomainsKey];
    if (cacheObject && [cacheObject isKindOfClass:[NSArray class]]) {
        return [BFTask taskWithResult:cacheObject];
    }
    else {
        return [self getUploadCDNDomainsIgnoringCache];
    }
}

- (BFTask *)refresh {

    BFTask *enumTask = [BFTask taskForCompletionOfAllTasks:
            [@[@"property_type",
               @"landlord_type",
               @"indoor_facility",
               @"region_highlight",
               @"rent_type",
               @"rent_period",
               @"user_type",
               @"community_facility",
               @"featured_facility_type",
               @"featured_facility_traffic_type"]
             map:^id(id object) {
                 return [self getEnumsByTypeIgnoringCache:object cancellationToken:nil];
             }]];

    //for network speed concern, now default only load uk
    CUTECountry *country = [CUTECountry new];
    country.ISOcountryCode = @"GB";
    BFTask *cityTask = [self getCitiesByCountryIgnoringCache:country];

    return [BFTask taskForCompletionOfAllTasks:@[enumTask, cityTask, [self getUploadCDNDomainsIgnoringCache]]];
}

- (void)clear {
    [_cache clearCache];
}

@end
