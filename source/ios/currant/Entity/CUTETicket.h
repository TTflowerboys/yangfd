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
#import "CUTERentPeriod.h"

#define kTicketStatusToRent @"to rent"
#define kTicketStatusDraft @"draft"
#define kTicketStatusDeleted @"deleted"


#define kTicketTitleMaxCharacterCount 30

@interface CUTETicket : MTLModel <MTLJSONSerializing>

@property (strong, nonatomic) NSString *identifier;

@property (strong, nonatomic) NSString *title;

@property (strong, nonatomic) NSString *ticketDescription;

@property (strong, nonatomic) NSString *status;

@property (strong, nonatomic) CUTEEnum *rentType;

@property (strong, nonatomic) CUTERentPeriod *rentPeriod;

@property (strong, nonatomic) CUTEEnum *depositType;

@property (strong, nonatomic) CUTEArea *space;

@property (nonatomic) BOOL billCovered;

@property (strong, nonatomic) CUTECurrency *price;

@property (nonatomic) NSTimeInterval rentAvailableTime;

@property (nonatomic) NSTimeInterval lastModifiedTime;

@property (strong, nonatomic) CUTEProperty *property;

- (NSString *)titleForDisplay;

- (NSDictionary *)toParams;

@end
