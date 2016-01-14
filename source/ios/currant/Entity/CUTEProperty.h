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
#import "CUTENeighborhood.h"

#define kPropertyStatusDraft @"draft"
#define kPropertyStatusDeleted @"deleted"

@interface CUTEProperty : MTLModel <MTLJSONSerializing, CUTEModelEditingListenerDelegate>

@property (nullable, strong, nonatomic) NSString *identifier;

@property (nullable, strong, nonatomic) CUTEEnum *propertyType;

@property (nullable, strong, nonatomic) NSArray *realityImages;

@property (nullable, strong, nonatomic) NSString *cover;

@property (nullable, strong, nonatomic) NSString *name;

@property (nullable, strong, nonatomic) NSNumber *latitude;

@property (nullable, strong, nonatomic) NSNumber *longitude;

@property (nullable, strong, nonatomic) CUTECountry *country;

@property (nullable, strong, nonatomic) CUTECity *city;

@property (nullable, strong, nonatomic) NSString *street;

@property (nullable, strong, nonatomic) NSString *zipcode;

@property (nullable, strong, nonatomic) NSString *community;

@property (nullable, strong, nonatomic) NSString *floor;

@property (nullable, strong, nonatomic) NSString *houseName;

@property (nullable, readonly, nonatomic) NSString *address;

@property (nullable, strong, nonatomic) CUTENeighborhood *neighborhood;

@property (nullable, strong, nonatomic) NSString *propertyDescription;

@property (nullable, strong, nonatomic) NSNumber *bedroomCount;

@property (nullable, strong, nonatomic) NSNumber *livingroomCount;

@property (nullable, strong, nonatomic) NSNumber *bathroomCount;

@property (nullable, strong, nonatomic) CUTEArea *space;

@property (nullable, strong, nonatomic) NSString *status;

@property (nullable, strong, nonatomic) NSArray *mainHouseTypes;

@property (nullable, strong, nonatomic) NSArray *indoorFacilities;

@property (nullable, strong, nonatomic) NSArray *communityFacilities;

@property (nullable, strong, nonatomic) NSArray *surroundings;

- (NSDictionary * __nonnull)toParams;

@end
