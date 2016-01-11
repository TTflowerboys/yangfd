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

@property (nonatomic, copy) NSString *__nullable neighborhood;
@property (nonatomic, copy) NSString *__nullable street;
@property (nonatomic, copy) NSString *__nullable thoroughfare; // street address, eg. 1 Infinite Loop
@property (nonatomic, copy) NSString *__nullable subThoroughfare; // eg. 1
@property (nonatomic, copy) NSString *__nullable postalCode; // zip code, eg. 95014
@property (nonatomic, strong) CUTECity *__nullable city; // city, eg. Cupertino
@property (nonatomic, strong) CUTECountry *__nullable country; // eg. United States
@property (strong, nonatomic) CLLocation *__nullable location;

+ (CUTEPlacemark *__nonnull)placeMarkWithCLPlaceMark:(CLPlacemark * __nonnull)placemark;

+ (CUTEPlacemark *__nonnull)placeMarkWithGoogleResult:(NSDictionary * __nonnull)result;

- (NSString *__nullable)address;

@end
