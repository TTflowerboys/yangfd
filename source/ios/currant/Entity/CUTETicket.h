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

#define kTicketTitleMinCharacterCount 8
#define kTicketTitleMaxCharacterCount 40

//TODO: add nullable and nonnull
extern NSString *LocalizedLivingRoomTitle(NSString *title, NSInteger roomCount);

@interface CUTETicket : MTLModel <MTLJSONSerializing, CUTEModelEditingListenerDelegate>

@property (strong, nonatomic) NSString *identifier;

@property (strong, nonatomic) NSString *title;

@property (strong, nonatomic) NSString *ticketDescription;

@property (strong, nonatomic) NSString *status;

@property (strong, nonatomic) CUTEEnum *rentType;

@property (strong, nonatomic) CUTEEnum *landlordType;

@property (strong, nonatomic) CUTEArea *space;

@property (strong, nonatomic) NSNumber *billCovered;

@property (strong, nonatomic) CUTECurrency *price;

@property (strong, nonatomic) NSNumber *rentAvailableTime;

@property (strong, nonatomic) NSNumber *rentDeadlineTime;

@property (strong, nonatomic) CUTETimePeriod *minimumRentPeriod;

@property (strong, nonatomic) CUTECurrency *deposit;

@property (strong, nonatomic) NSNumber *lastModifiedTime;

@property (strong, nonatomic) CUTEProperty *property;

@property (strong, nonatomic) CUTEUser *creatorUser;

@property (strong, nonatomic) NSString *genderRequirement;

@property (strong, nonatomic) NSNumber *minAge;

@property (strong, nonatomic) NSNumber *maxAge;

@property (strong, nonatomic) CUTEEnum *occupation;

@property (strong, nonatomic) NSNumber *noSmoking;

@property (strong, nonatomic) NSNumber *noPet;

@property (strong, nonatomic) NSNumber *noBaby;

@property (strong, nonatomic) NSString *otherRequirements;

@property (strong, nonatomic) NSNumber *currentMaleRoommates;

@property (strong, nonatomic) NSNumber *currentFemaleRoommates;

@property (strong, nonatomic) NSNumber *availableRooms;

@property (strong, nonatomic) NSNumber *independentBathroom;

- (NSString *)titleForDisplay;

- (NSDictionary *)toParams;

@end
