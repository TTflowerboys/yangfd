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
#import "CUTETracker.h"
#import "BBTJSON.h"
#import "INTULocationManager.h"
#import "CUTEPostcodePlace.h"

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

- (BFTask *)reverseProxyWithLink:(NSString *)link {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    NSURLRequest *request = [NSURLRequest requestWithURL:[NSURL URLWithString:CONCAT(@"/reverse_proxy?link=", [link URLEncode]) relativeToURL:[CUTEConfiguration hostURL]]];
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^(void) {
        NSHTTPURLResponse *response = nil;
        NSError *error = nil;
        NSData *data = [NSURLConnection sendSynchronousRequest:request returningResponse:&response error:&error];
        NSDictionary *dic = [data JSONData];

        dispatch_async(dispatch_get_main_queue(), ^(void) {
            if (error) {
                [tcs setError:error];
            }
            else if (dic) {
                [tcs setResult:dic];
            }
            else {
                if (response.statusCode == 500) {
                    [tcs setError:[NSError errorWithDomain:@"Google" code:response.statusCode userInfo:@{NSLocalizedDescriptionKey: STR(@"请求失败")}]];
                }
                else {
                    [tcs setError:[NSError errorWithDomain:@"Google" code:response.statusCode userInfo:@{NSLocalizedDescriptionKey: [NSHTTPURLResponse localizedStringForStatusCode:response.statusCode]}]];
                }

            }
        });
    });
    return tcs.task;
}


- (BFTask *)reverseGeocodeLocation:(CLLocation *)location {

    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    NSString *geocoderURLString = [NSString stringWithFormat:@"https://maps.googleapis.com/maps/api/geocode/json?latlng=%lf,%lf&key=%@&language=en", location.coordinate.latitude, location.coordinate.longitude, [CUTEConfiguration googleAPIKey]];

    __block NSInteger retryCount = 3;
    __block dispatch_block_t requestBlock;

    requestBlock = ^ {

        [[self reverseProxyWithLink:geocoderURLString] continueWithBlock:^id(BFTask *task) {
            NSDictionary *dic = task.result;
            NSDictionary *result = nil;
            if (dic && dic[@"results"] && !IsArrayNilOrEmpty(dic[@"results"])) {
                result = dic[@"results"][0];
            }
            if (result) {
                CUTEPlacemark *placemark = [CUTEPlacemark placeMarkWithGoogleResult:result];

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
                    [[CUTETracker sharedInstance] trackError:task.error];
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
    __block dispatch_block_t requestBlock;
    requestBlock = ^ {
        [[self reverseProxyWithLink:geocoderURLString] continueWithBlock:^id(BFTask *task) {
            NSDictionary *dic = task.result;
            NSDictionary *result = nil;
            if (dic && dic[@"results"] && !IsArrayNilOrEmpty(dic[@"results"])) {
                result = dic[@"results"][0];
            }
            if (result) {
                CUTEPlacemark *placemark = [CUTEPlacemark placeMarkWithGoogleResult:result];
                [tcs setResult:placemark];
                retryCount = 0;
            }
            else {
                if (retryCount == 0) {
                    [tcs setError:task.error];
                }
                else {
                    [[CUTETracker sharedInstance] trackError:task.error];
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
    return [[CUTEAPIManager sharedInstance] POST:@"/api/1/postcode/search" parameters:@{@"postcode_index":postCodeIndex, @"country": countryCode} resultClass:[CUTEPostcodePlace class]];
}

- (BFTask *)requestCurrentLocation {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    //only need INTULocationAccuracyCity, if set other small accuracy will be very slow
    [[INTULocationManager sharedInstance] requestLocationWithDesiredAccuracy:INTULocationAccuracyCity timeout:30 delayUntilAuthorized:YES block:^(CLLocation *currentLocation, INTULocationAccuracy achievedAccuracy, INTULocationStatus status) {
        if (currentLocation) {
            [tcs setResult:currentLocation];
        }
        else {
            if (status == INTULocationStatusTimedOut) {
                [tcs setError:[NSError errorWithDomain:@"INTULocationManager" code:0 userInfo:@{NSLocalizedDescriptionKey: STR(@"获取当前位置超时")}]];
            }
            else if (status == INTULocationStatusError) {
                [tcs setError:[NSError errorWithDomain:@"INTULocationManager" code:0 userInfo:@{NSLocalizedDescriptionKey: STR(@"获取当前位置失败")}]];
            }
            else if (status == INTULocationStatusServicesDenied) {
                [tcs cancel];
            }
            else {
                [tcs setError:nil];
            }
        }

    }];
    return tcs.task;
}


@end
