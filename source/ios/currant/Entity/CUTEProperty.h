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
#import "CUTEI18n.h"
#import "CUTEArea.h"
#import <CoreLocation/CoreLocation.h>

#define kPropertyStatusDraft @"draft"

@interface CUTEProperty : MTLModel <MTLJSONSerializing>

@property (strong, nonatomic) NSString *identifier;

@property (strong, nonatomic) CUTEEnum *propertyType;

@property (strong, nonatomic) NSArray * realityImages;

@property (strong, nonatomic) CUTEI18n *name;

@property (strong, nonatomic) CLLocation *location;

@property (strong, nonatomic) CUTEEnum *country;

@property (strong, nonatomic) CUTEEnum *city;

@property (strong, nonatomic) CUTEI18n *street;

@property (strong, nonatomic) NSString *zipcode;

@property (readonly, nonatomic) NSString *address;

@property (strong, nonatomic) CUTEI18n *propertyDescription;

@property (nonatomic) NSInteger bedroomCount;

@property (strong, nonatomic) CUTEArea *space;

@property (strong, nonatomic) NSString *status;

@property (strong, nonatomic) NSArray *indoorFacilities;

@property (strong, nonatomic) NSArray *communityFacilities;


- (NSDictionary *)toParams;

@end
