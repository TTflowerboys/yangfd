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

@property (readonly, nonatomic) CUTEUser *user;

- (BOOL)isUserLoggedIn;

- (void)persistAllCookies;

- (void)clearAllCookies;

- (void)restoreAllCookies;

- (void)saveUser:(CUTEUser *)user;

- (void)deleteUser;

- (void)saveRentTicket:(CUTETicket *)ticket;

- (NSArray *)getAllUnfinishedRentTickets;

- (CUTETicket *)getRentTicketById:(NSString *)ticketId;

- (void)markRentTicketDeleted:(CUTETicket *)ticket;

- (BOOL)isRentTicketDeleted:(NSString *)ticketId;

- (void)clearAllRentTickets;

- (void)saveImageURLString:(NSString *)imageURLStr forAssetURLString:(NSString *)urlStr;

- (NSString *)getImageURLStringForAssetURLString:(NSString *)urlStr;

- (void)saveAssetURLString:(NSString *)urlStr forImageURLString:(NSString *)imageURLStr;

- (NSString *)getAssetURLStringForImageURLString:(NSString *)imageURLStr;

- (void)saveScreen:(NSString *)screenName lastVisitTime:(NSTimeInterval)lastVisitTime;

- (NSTimeInterval)getScreenLastVistiTime:(NSString *)screenName;

@end
