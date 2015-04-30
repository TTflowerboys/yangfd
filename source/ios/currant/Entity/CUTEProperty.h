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

#define kPropertyStatusDraft @"draft"
#define kPropertyStatusDeleted @"deleted"

@interface CUTEProperty : MTLModel <MTLJSONSerializing>

@property (strong, nonatomic) NSString *identifier;

@property (strong, nonatomic) CUTEEnum *propertyType;

@property (strong, nonatomic) NSArray * realityImages;

@property (strong, nonatomic) NSString *name;

@property (strong, nonatomic) CLLocation *location;

@property (strong, nonatomic) CUTEEnum *country;

@property (strong, nonatomic) CUTEEnum *city;

@property (strong, nonatomic) NSString *street;

@property (strong, nonatomic) NSString *zipcode;

@property (readonly, nonatomic) NSString *address;

@property (strong, nonatomic) NSString *propertyDescription;

@property (nonatomic) NSInteger bedroomCount;

@property (nonatomic) NSInteger livingroomCount;

@property (nonatomic) NSInteger bathroomCount;

@property (strong, nonatomic) CUTEArea *space;

@property (strong, nonatomic) NSString *status;

@property (strong, nonatomic) NSArray *indoorFacilities;

@property (strong, nonatomic) NSArray *communityFacilities;


- (NSDictionary *)toParams;

@end
