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

- (void)savePublishedTicketWithId:(NSString *)ticketId;

- (NSUInteger)getPublishedTicketCount;

- (void)saveFavoriteTicketWithId:(NSString *)ticketId;

- (NSUInteger)getFavoriteTicketCount;

@end
