//
//  CUTEProperty.h
//  currant
//
//  Created by Foster Yin on 4/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "MTLModel.h"
#import "CUTEEnum.h"
#import "CUTEArea.h"
#import "CUTEArea.h"
#import <CoreLocation/CoreLocation.h>
#import "CUTECurrency.h"
#import "CUTEHouseType.h"
#import "CUTECity.h"
#import "CUTECountry.h"
#import "CUTEModelEditingListener.h"

#define kPropertyStatusDraft @"draft"
#define kPropertyStatusDeleted @"deleted"

@interface CUTEProperty : MTLModel <MTLJSONSerializing, CUTEModelEditingListenerDelegate>

@property (strong, nonatomic) NSString *identifier;

@property (strong, nonatomic) CUTEEnum *propertyType;

@property (strong, nonatomic) NSArray *realityImages;

@property (strong, nonatomic) NSString *cover;

@property (strong, nonatomic) NSString *name;

@property (nonatomic, strong) NSNumber *latitude;

@property (nonatomic, strong) NSNumber *longitude;

@property (strong, nonatomic) CUTECountry *country;

@property (strong, nonatomic) CUTECity *city;

@property (strong, nonatomic) NSString *street;

@property (strong, nonatomic) NSString *zipcode;

@property (strong, nonatomic) NSString *community;

@property (strong, nonatomic) NSString *floor;

@property (strong, nonatomic) NSString *houseName;

@property (readonly, nonatomic) NSString *address;

@property (strong, nonatomic) NSString *propertyDescription;

@property (strong, nonatomic) NSNumber *bedroomCount;

@property (strong, nonatomic) NSNumber *livingroomCount;

@property (strong, nonatomic) NSNumber *bathroomCount;

@property (strong, nonatomic) CUTEArea *space;

@property (strong, nonatomic) NSString *status;

@property (strong, nonatomic) NSArray *mainHouseTypes;

@property (strong, nonatomic) NSArray *indoorFacilities;

@property (strong, nonatomic) NSArray *communityFacilities;

- (NSDictionary *)toParams;

@end
