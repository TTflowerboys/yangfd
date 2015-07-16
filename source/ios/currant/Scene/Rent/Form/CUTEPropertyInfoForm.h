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

@interface CUTEPropertyInfoForm : CUTETicketForm

@property (nonatomic, strong) NSArray *photos;
@property (nonatomic, strong) CUTERentPriceForm *rentPrice;
@property (strong, nonatomic) CUTEEnum *landlordType;
@property (nonatomic, strong) CUTEEnum *propertyType;
@property (nonatomic, assign) NSUInteger bedroomCount;
@property (nonatomic, assign) NSUInteger livingroomCount;
@property (nonatomic, assign) NSUInteger bathroomCount;
@property (strong, nonatomic) CUTERentTypeListForm *rentType;
@property (strong, nonatomic) NSString *address;
@property (nonatomic, strong) CUTEAreaForm *area;
@property (nonatomic, strong) CUTEPropertyMoreInfoForm *moreInfo;
@property (strong, nonatomic) CUTERentContactForm *submit;


- (void)setAllLandlordTypes:(NSArray *)allLandlordTypes;

- (void)setAllPropertyTypes:(NSArray *)allPropertyTypes;

+ (CUTEEnum *)getDefaultLandloardType:(NSArray *)types;

+ (CUTEEnum *)getDefaultPropertyType:(NSArray *)types;

@end
