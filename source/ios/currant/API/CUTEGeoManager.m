//
//  CUTEGeoManager.m
//  currant
//
//  Created by Foster Yin on 6/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEGeoManager.h"
#import "BFTask.h"
#import "CUTEAPIManager.h"
#import "CUTECommonMacro.h"
#import "CUTEPlacemark.h"
#import "CUTEConfiguration.h"
#import "CUTEEnumManager.h"
#import "NSArray+ObjectiveSugar.h"
#import "NSString+Encoding.h"

@implementation CUTEGeoManager

+ (instancetype)sharedInstance
{
    static dispatch_once_t pred;
    __strong static id sharedInstance = nil;

    dispatch_once(&pred, ^{
        sharedInstance = [[[self class] alloc] init];
    });

    return sharedInstance;
}

+ (NSString *)buildComponentsWithDictionary:(NSDictionary *)dictionary {
    if (dictionary && dictionary.count) {
        NSMutableArray *array = [NSMutableArray array];
        [dictionary enumerateKeysAndObjectsUsingBlock:^(NSString* key, NSString* obj, BOOL *stop) {
            [array addObject:CONCAT(key, @":", obj)];
        }];
        return [array componentsJoinedByString:@"|"];
    }
    return nil;
}


- (BFTask *)reverseGeocodeLocation:(CLLocation *)location {

    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    NSString *geocoderURLString = [NSString stringWithFormat:@"https://maps.googleapis.com/maps/api/geocode/json?latlng=%lf,%lf&key=%@&language=en", location.coordinate.latitude, location.coordinate.longitude, [CUTEConfiguration googleAPIKey]];

    __block NSInteger retryCount = 3;
    dispatch_block_t requestBlock = ^ {
        [[[CUTEAPIManager sharedInstance] POST:geocoderURLString parameters:nil resultClass:nil resultKeyPath:@"results"] continueWithBlock:^id(BFTask *task) {
            if (!IsArrayNilOrEmpty(task.result)) {
                CUTEPlacemark *placemark = [CUTEPlacemark placeMarkWithGoogleResult:task.result[0]];

                [[[CUTEEnumManager sharedInstance] getCountriesWithCountryCode:NO] continueWithBlock:^id(BFTask *task) {
                    if (!IsArrayNilOrEmpty(task.result)) {
                        NSArray *coutries = [(NSArray *)task.result select:^BOOL(CUTECountry *object) {
                            return [[object code] isEqualToString:placemark.country.code];
                        }];
                        CUTECountry *country = IsArrayNilOrEmpty(coutries)? nil: [coutries firstObject];
                        [[[CUTEEnumManager sharedInstance] getCitiesByCountry:country] continueWithBlock:^id(BFTask *task) {
                            NSArray *cities = task.result;
                            if (!IsArrayNilOrEmpty(cities)) {
                                CUTECity *city = [cities find:^BOOL(CUTECity *object) {
                                    return [[[placemark city].name lowercaseString] hasPrefix:[[object name] lowercaseString]];
                                }];
                                placemark.country = country;
                                placemark.city = city;
                                [tcs setResult:placemark];
                                retryCount = 0;
                            }
                            else {
                                if (retryCount == 0) {
                                    [tcs setError:task.error];
                                }
                                else {
                                    retryCount--;
                                    requestBlock();
                                }
                            }

                            return task;
                        }];
                    }
                    else {
                        if (retryCount == 0) {
                            [tcs setError:task.error];
                        }
                        else {
                            retryCount--;
                            requestBlock();
                        }
                    }
                    
                    return task;
                }];
                
            }
            else {
                if (retryCount == 0) {
                    [tcs setError:task.error];
                }
                else {
                    retryCount--;
                    requestBlock();
                }
            }
            return nil;
        }];
    };

    retryCount--;
    requestBlock();

    return tcs.task;
}

- (BFTask *)geocodeWithAddress:(NSString *)address components:(NSString *)components {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    NSString *geocoderURLString = [NSString stringWithFormat:@"https://maps.googleapis.com/maps/api/geocode/json?key=%@&language=en&components=%@", [CUTEConfiguration googleAPIKey], [components URLEncode]];
    if (!IsNilNullOrEmpty(address)) {
        geocoderURLString = CONCAT(geocoderURLString, @"&", @"address=", [address URLEncode]);
    }

    __block NSInteger retryCount = 3;
    dispatch_block_t requestBlock = ^ {
        [[[CUTEAPIManager sharedInstance] POST:geocoderURLString parameters:nil resultClass:nil resultKeyPath:@"results"] continueWithBlock:^id(BFTask *task) {
            if (!IsArrayNilOrEmpty(task.result)) {
                CUTEPlacemark *placemark = [CUTEPlacemark placeMarkWithGoogleResult:task.result[0]];
                [tcs setResult:placemark];
                retryCount = 0;
            }
            else {
                if (retryCount == 0) {
                    [tcs setError:task.error];
                }
                else {
                    retryCount--;
                    requestBlock();
                }
            }
            return nil;
        }];
    };

    retryCount--;
    requestBlock();

    return tcs.task;
}


- (BFTask *)searchPostcodeIndex:(NSString *)postCodeIndex countryCode:(NSString *)countryCode {
    return [[[CUTEAPIManager sharedInstance] POST:@"/api/1/postcode/search" parameters:@{@"postcode_index":postCodeIndex, @"country": countryCode} resultClass:nil] continueWithBlock:^id(BFTask *task) {
        NSArray *array = task.result;
        NSDictionary *resultDic = nil;
        if (!IsArrayNilOrEmpty(array)) {
            resultDic = array[0];
        }
        if (resultDic[@"latitude"] && resultDic[@"longitude"]) {
            CLLocation *location = [[CLLocation alloc] initWithLatitude:[resultDic[@"latitude"] doubleValue] longitude:[resultDic[@"longitude"] doubleValue]];
            return [BFTask taskWithResult:location];
        }
        else {
            return task;
        }
    }];
}


@end
