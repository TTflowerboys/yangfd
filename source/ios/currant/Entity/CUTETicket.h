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
#import "CUTETimePeriod.h"
#import "CUTEModelEditingListener.h"
#import "CUTEUser.h"

#define kTicketStatusToRent @"to rent"
#define kTicketStatusDraft @"draft"
#define kTicketStatusDeleted @"deleted"


#define kTicketTitleMaxCharacterCount 30

@interface CUTETicket : MTLModel <MTLJSONSerializing, CUTEModelEditingListenerDelegate>

@property (strong, nonatomic) NSString *identifier;

@property (strong, nonatomic) NSString *title;

@property (strong, nonatomic) NSString *ticketDescription;

@property (strong, nonatomic) NSString *status;

@property (strong, nonatomic) CUTEEnum *rentType;

@property (strong, nonatomic) CUTEEnum *depositType;

@property (strong, nonatomic) CUTEEnum *landlordType;

@property (strong, nonatomic) CUTEArea *space;

@property (strong, nonatomic) NSNumber *billCovered;

@property (strong, nonatomic) CUTECurrency *price;

@property (strong, nonatomic) NSNumber *rentAvailableTime;

@property (strong, nonatomic) NSNumber *rentDeadlineTime;

@property (strong, nonatomic) CUTETimePeriod *minimumRentPeriod;

@property (strong, nonatomic) NSNumber *lastModifiedTime;

@property (strong, nonatomic) CUTEProperty *property;

@property (strong, nonatomic) CUTEUser *creatorUser;


- (NSString *)titleForDisplay;

- (NSDictionary *)toParams;

@end
