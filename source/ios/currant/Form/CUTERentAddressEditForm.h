//
//  CUTERentAddressEditForm.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "CUTEForm.h"
#import "CUTEPropertyInfoForm.h"
#import "CUTEEnum.h"
#import "CUTECityEnum.h"

@interface CUTERentAddressEditForm : CUTEForm

@property (strong, nonatomic) NSString *street;
@property (strong, nonatomic) CUTECityEnum *city;
@property (strong, nonatomic) NSString *postcode;
@property (strong, nonatomic) CUTEEnum *country;

- (void)setAllCountries:(NSArray *)allCountries;

- (void)setAllCities:(NSArray *)allCities;

@end
