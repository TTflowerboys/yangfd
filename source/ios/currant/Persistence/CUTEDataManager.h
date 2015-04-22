//
//  CUTEDataManager.h
//  currant
//
//  Created by Foster Yin on 3/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "CUTETicket.h"
#import "CUTEUser.h"

@interface CUTEDataManager : NSObject

+ (instancetype)sharedInstance;

@property (strong, nonatomic) CUTEUser *user;

- (BOOL)isUserLoggedIn;

- (void)saveAllCookies;

- (void)cleanAllCookies;

- (void)restoreAllCookies;

- (void)saveRentTicketToUnfinised:(CUTETicket *)ticket;

- (NSArray *)getAllUnfinishedRentTickets;

@end
