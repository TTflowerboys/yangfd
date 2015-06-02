//
//  CUTEPlaceMark.h
//  currant
//
//  Created by Foster Yin on 4/4/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>
#import "CUTECountry.h"
#import "CUTECity.h"

@interface CUTEPlacemark : NSObject

@property (nonatomic, copy) NSString *street;
@property (nonatomic, copy) NSString *thoroughfare; // street address, eg. 1 Infinite Loop
@property (nonatomic, copy) NSString *subThoroughfare; // eg. 1
@property (nonatomic, copy) NSString *postalCode; // zip code, eg. 95014
@property (nonatomic, strong) CUTECity *city; // city, eg. Cupertino
@property (nonatomic, strong) CUTECountry *country; // eg. United States
@property (strong, nonatomic) CLLocation *location;

+ (CUTEPlacemark *)placeMarkWithCLPlaceMark:(CLPlacemark *)placemark;

+ (CUTEPlacemark *)placeMarkWithGoogleResult:(NSDictionary *)result;

- (NSString *)address;

@end
