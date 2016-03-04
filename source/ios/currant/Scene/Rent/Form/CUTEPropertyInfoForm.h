//
//  CUTEPropertyInfoForm.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "CUTEForm.h"
#import "CUTEPropertyMoreInfoForm.h"
#import "CUTERentPriceForm.h"
#import "CUTERentContactForm.h"
#import "CUTEEnum.h"
#import "CUTEAreaForm.h"
#import "CUTEProperty.h"
#import "CUTERentTypeListForm.h"
#import "CUTETicketForm.h"
#import "CUTERentPeriodForm.h"
#import "CUTERentStatusForm.h"
#import "currant-Swift.h"


@class CUTERentAddressEditForm;

@interface CUTEPropertyInfoForm : CUTETicketForm

@property (nonatomic, strong) NSArray *photos;
@property (nonatomic, strong) CUTERentPriceForm *rentPrice;
@property (strong, nonatomic) CUTERentPeriodForm *rentPeriod;
@property (strong, nonatomic) CUTEEnum *landlordType;
@property (nonatomic, strong) CUTEEnum *propertyType;
@property (nonatomic, assign) NSUInteger bedroomCount;
@property (nonatomic, assign) NSUInteger livingroomCount;
@property (nonatomic, assign) NSUInteger bathroomCount;
@property (strong, nonatomic) CUTERentTypeListForm *rentType;
@property (strong, nonatomic) CUTERentAddressEditForm *rentAddress;
@property (strong, nonatomic) CUTESurroundingForm *surrounding;
@property (nonatomic, strong) CUTEPropertyMoreInfoForm *moreInfo;
@property (nonatomic, strong) CUTERentStatusForm *status;
@property (strong, nonatomic) CUTERentContactForm *submit;


- (void)setAllLandlordTypes:(NSArray *)allLandlordTypes;

- (void)setAllPropertyTypes:(NSArray *)allPropertyTypes;

+ (CUTEEnum *)getDefaultLandloardType:(NSArray *)types;

+ (CUTEEnum *)getDefaultPropertyType:(NSArray *)types;

@end
