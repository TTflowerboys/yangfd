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
#import "CUTECity.h"
#import "CUTECountry.h"
#import "CUTETicket.h"
#import "BFTask.h"
#import "CUTETicketForm.h"
#import "CUTENeighborhood.h"

@interface CUTERentAddressEditForm : CUTETicketForm

@property (strong, nonatomic) CUTECountry *country;
@property (strong, nonatomic) CUTECity *city;
@property (strong, nonatomic) CUTENeighborhood *neighborhood;
@property (strong, nonatomic) NSString *postcode;
@property (strong, nonatomic) NSString *street;
@property (strong, nonatomic) NSString *community;
@property (strong, nonatomic) NSString *floor;
@property (strong, nonatomic) NSString *houseName;
@property (strong, nonatomic) CLLocation *location;


@property (nonatomic) BOOL singleUseForReedit;

- (void)setAllCountries:(NSArray *)allCountries;

- (void)setAllCities:(NSArray *)allCities;

- (void)setAllNeighborhoods:(NSArray *)allNeighborhoods;

- (BFTask *)updateWithTicket:(CUTETicket *)ticket;

- (NSError *)validateFormWithScenario:(NSString *)scenario;

@end
