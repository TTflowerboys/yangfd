//
//  CUTEGeoManager.h
//  currant
//
//  Created by Foster Yin on 6/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "BFTask.h"
#import <CoreLocation/CoreLocation.h>

@interface CUTEGeoManager : NSObject

+ (instancetype)sharedInstance;

+ (NSString *)buildComponentsWithDictionary:(NSDictionary *)dictionary;

- (BFTask *)reverseGeocodeLocation:(CLLocation *)location;

- (BFTask *)geocodeWithAddress:(NSString *)address components:(NSString *)components;

- (BFTask *)searchPostcodeIndex:(NSString *)postCodeIndex countryCode:(NSString *)countryCode;

@end
