//
//  CUTEUsageRecorder.h
//  currant
//
//  Created by Foster Yin on 6/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface CUTEUsageRecorder : NSObject

+ (instancetype)sharedInstance;

- (void)saveScreen:(NSString *)screenName lastVisitTime:(NSTimeInterval)lastVisitTime;

- (NSTimeInterval)getScreenLastVistiTime:(NSString *)screenName;

- (void)saveEnterForegroundTime:(NSTimeInterval)time;

- (NSTimeInterval)getLastEnterForegroundTime;

- (NSTimeInterval)getFirstEnterForegroundTime;

- (NSUInteger)getUsageDays;

- (void)savePublishedTicketWithId:(NSString *)ticketId;

- (NSUInteger)getPublishedTicketCount;

- (void)saveFavoriteTicketWithId:(NSString *)ticketId;

- (NSUInteger)getFavoriteTicketCount;

- (void)saveVisitedTicketWithId:(NSString *)ticketId;

- (NSUInteger)getVisitedTicketCount;

- (void)saveApptentiveEventTriggered:(NSString *)event;

- (BOOL)isApptentiveEventTriggered:(NSString *)event;

@end
