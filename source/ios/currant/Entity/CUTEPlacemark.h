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

@property (nonatomic, copy) NSString *street;
@property (nonatomic, copy) NSString *zipcode; // zip code, eg. 95014
@property (nonatomic, strong) CUTECityEnum *city; // city, eg. Cupertino
@property (nonatomic, strong) CUTEEnum *country; // eg. United States

+ (CUTEPlacemark *)placeMarkWithCLPlaceMark:(CLPlacemark *)placemark;

+ (CUTEPlacemark *)placeMarkWithGoogleResult:(NSDictionary *)result;

- (NSString *)address;

@end
