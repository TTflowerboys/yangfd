//
//  CUTETicket.h
//  currant
//
//  Created by Foster Yin on 4/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Mantle.h>
#import "CUTEEnum.h"
#import "CUTEArea.h"
#import "CUTECurrency.h"
#import "CUTEProperty.h"
#import "CUTEI18n.h"

#define kTicketStatusToRent @"to rent"

@interface CUTETicket : MTLModel <MTLJSONSerializing>

@property (strong, nonatomic) NSString *identifier;

@property (strong, nonatomic) NSString *title;

@property (strong, nonatomic) NSString *ticketDescription;

@property (strong, nonatomic) NSString *status;

@property (strong, nonatomic) CUTEEnum *rentType;

@property (strong, nonatomic) CUTEEnum *rentPeriod;

@property (strong, nonatomic) CUTEEnum *depositType;

@property (strong, nonatomic) CUTEArea *space;

@property (nonatomic) BOOL billCovered;

@property (strong, nonatomic) CUTECurrency *price;

@property (strong, nonatomic) NSDate *rentAvailableTime;

@property (strong, nonatomic) CUTEProperty *property;


- (NSDictionary *)toParams;

@end
