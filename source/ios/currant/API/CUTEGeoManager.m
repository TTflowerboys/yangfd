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


- (BFTask *)reverseGeocodeLocation:(CLLocation *)location {

    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    NSString *geocoderURLString = [NSString stringWithFormat:@"https://maps.googleapis.com/maps/api/geocode/json?latlng=%lf,%lf&key=%@&language=en", location.coordinate.latitude, location.coordinate.longitude, [CUTEConfiguration googleAPIKey]];

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

                        }
                        else {
                            [tcs setError:task.error];
                        }

                        return task;
                    }];
                }
                else {
                    [tcs setError:task.error];
                }

                return task;
            }];

        }
        else {
            [tcs setError:task.error];
        }
        return nil;
    }];
    return tcs.task;
}

- (BFTask *)geocodeWithComponents:(NSString *)components {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    NSString *geocoderURLString = [NSString stringWithFormat:@"https://maps.googleapis.com/maps/api/geocode/json?key=%@&language=en&components=%@", [CUTEConfiguration googleAPIKey], [components URLEncode]];

    [[[CUTEAPIManager sharedInstance] POST:geocoderURLString parameters:nil resultClass:nil resultKeyPath:@"results"] continueWithBlock:^id(BFTask *task) {
        if (!IsArrayNilOrEmpty(task.result)) {
            CUTEPlacemark *placemark = [CUTEPlacemark placeMarkWithGoogleResult:task.result[0]];
            [tcs setResult:placemark];
        }
        else {
            [tcs setError:task.error];
        }
        return nil;
    }];
    return tcs.task;
}

@end
