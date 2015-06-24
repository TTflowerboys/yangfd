//
//  CUTEUsageRecorder.m
//  currant
//
//  Created by Foster Yin on 6/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEUsageRecorder.h"
#import "CUTEDataManager.h"
#import "NSArray+ObjectiveSugar.h"
#import "CUTECommonMacro.h"

#define KTABLE_SCREEN_LAST_VISIT_TIME @"cute_screen_last_visit_time"

#define KTABLE_SCREEN_ENTER_FOREGROUND_TIME @"cute_screen_enter_foreground_time"

@implementation CUTEUsageRecorder

+ (instancetype)sharedInstance
{
    static dispatch_once_t pred;
    __strong static id sharedInstance = nil;

    dispatch_once(&pred, ^{
        sharedInstance = [[[self class] alloc] init];
        [sharedInstance setupStore];
    });

    return sharedInstance;
}

- (void)setupStore {
    [@[KTABLE_SCREEN_ENTER_FOREGROUND_TIME,
       KTABLE_SCREEN_LAST_VISIT_TIME] each:^(id object) {
           [self.store createTableWithName:object];
       }];
}

- (YTKKeyValueStore *)store {
    return [CUTEDataManager sharedInstance].store;
}

#pragma mark - Screen Last visit time

- (void)saveScreen:(NSString *)screenName lastVisitTime:(NSTimeInterval)lastVisitTime {
    [self.store putNumber:[NSNumber numberWithDouble:lastVisitTime] withId:screenName intoTable:KTABLE_SCREEN_LAST_VISIT_TIME];
}

- (NSTimeInterval)getScreenLastVistiTime:(NSString *)screenName {
    return [[self.store getNumberById:screenName fromTable:KTABLE_SCREEN_LAST_VISIT_TIME] doubleValue];
}

#pragma mark - Enter Foreground

- (void)saveEnterForegroundTime:(NSTimeInterval)time {
    [[self store] putNumber:@(time) withId:[[NSNumber numberWithDouble:time] stringValue] intoTable:KTABLE_SCREEN_ENTER_FOREGROUND_TIME];
}

//TODO ??? need reduce data size
- (NSTimeInterval)getFirstEnterForegroundTime {
    NSArray *items = [[self store] getAllItemsFromTable:KTABLE_SCREEN_ENTER_FOREGROUND_TIME];
    if (!IsArrayNilOrEmpty(items)) {
        YTKKeyValueItem *item = [items firstObject];
        NSNumber *number = item.itemObject;
        return [number doubleValue];
    }
    return 0;
}

- (NSTimeInterval)getLastEnterForegroundTime {
    NSArray *items = [[self store] getAllItemsFromTable:KTABLE_SCREEN_ENTER_FOREGROUND_TIME];
    if (!IsArrayNilOrEmpty(items)) {
        YTKKeyValueItem *item = [items lastObject];
        NSNumber *number = item.itemObject;
        return [number doubleValue];
    }
    return 0;
}



@end
