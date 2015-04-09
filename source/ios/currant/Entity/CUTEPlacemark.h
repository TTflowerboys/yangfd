//
//  CUTEPlaceMark.h
//  currant
//
//  Created by Foster Yin on 4/4/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>
#import "CUTEEnum.h"
#import "CUTECityEnum.h"

@interface CUTEPlacemark : NSObject

@property (nonatomic, copy) NSString *name; // eg. Apple Inc.
@property (nonatomic, copy) NSString *thoroughfare; // street address, eg. 1 Infinite Loop
@property (nonatomic, copy) NSString *subThoroughfare; // eg. 1
@property (nonatomic, strong) CUTECityEnum *city; // city, eg. Cupertino
@property (nonatomic, copy) NSString *subLocality; // neighborhood, common name, eg. Mission District
@property (nonatomic, copy) NSString *administrativeArea; // state, eg. CA
@property (nonatomic, copy) NSString *subAdministrativeArea; // county, eg. Santa Clara
@property (nonatomic, copy) NSString *zipcode; // zip code, eg. 95014
@property (nonatomic, copy) NSString *ISOcountryCode; // eg. US
@property (nonatomic, strong) CUTEEnum *country; // eg. United States
@property (nonatomic, copy) NSString *inlandWater; // eg. Lake Tahoe
@property (nonatomic, copy) NSString *ocean; // eg. Pacific Ocean
@property (nonatomic, copy) NSArray *areasOfInterest; // eg. Golden Gate Park

+ (CUTEPlacemark *)placeMarkWithCLPlaceMark:(CLPlacemark *)placemark;

+ (CUTEPlacemark *)placeMarkWithGoogleResult:(NSDictionary *)result;

- (NSString *)address;

- (NSString *)street;

@end
