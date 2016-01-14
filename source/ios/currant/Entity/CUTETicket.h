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

extern NSString * __nonnull LocalizedLivingRoomTitle(NSString * __nonnull title, NSInteger roomCount);


@interface CUTETicket : MTLModel <MTLJSONSerializing, CUTEModelEditingListenerDelegate>

@property (nullable, strong, nonatomic) NSString *identifier;

@property (nullable, strong, nonatomic) NSString *title;

@property (nullable, strong, nonatomic) NSString *ticketDescription;

@property (nullable, strong, nonatomic) NSString *status;

@property (nullable, strong, nonatomic) CUTEEnum *rentType;

@property (nullable, strong, nonatomic) CUTEEnum *landlordType;

@property (nullable, strong, nonatomic) CUTEArea *space;

@property (nullable, strong, nonatomic) NSNumber *billCovered;

@property (nullable, strong, nonatomic) CUTECurrency *price;

@property (nullable, strong, nonatomic) NSNumber *rentAvailableTime;

@property (nullable, strong, nonatomic) NSNumber *rentDeadlineTime;

@property (nullable, strong, nonatomic) CUTETimePeriod *minimumRentPeriod;

@property (nullable, strong, nonatomic) CUTECurrency *deposit;

@property (nullable, strong, nonatomic) NSNumber *lastModifiedTime;

@property (nonnull, strong, nonatomic) CUTEProperty *property;

@property (nullable, strong, nonatomic) CUTEUser *creatorUser;

@property (nullable, strong, nonatomic) NSString *genderRequirement;

@property (nullable, strong, nonatomic) NSNumber *minAge;

@property (nullable, strong, nonatomic) NSNumber *maxAge;

@property (nullable, strong, nonatomic) CUTEEnum *occupation;

@property (nullable, strong, nonatomic) NSNumber *noSmoking;

@property (nullable, strong, nonatomic) NSNumber *noPet;

@property (nullable, strong, nonatomic) NSNumber *noBaby;

@property (nullable, strong, nonatomic) NSString *otherRequirements;

@property (nullable, strong, nonatomic) NSNumber *currentMaleRoommates;

@property (nullable, strong, nonatomic) NSNumber *currentFemaleRoommates;

@property (nullable, strong, nonatomic) NSNumber *availableRooms;

@property (nullable, strong, nonatomic) NSNumber *independentBathroom;

- (NSString * __nullable)titleForDisplay;

- (NSDictionary * __nonnull)toParams;

@end
