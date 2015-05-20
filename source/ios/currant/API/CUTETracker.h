//
//  CUTETracker.h
//  currant
//
//  Created by Foster Yin on 5/13/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "CUTETrackParams.h"


@interface CUTETracker : NSObject

+ (instancetype)sharedInstance;

- (void)setup;

- (void)trackScreen:(NSString *)screenName;

- (void)trackStayDurationWithCategory:(NSString *)category screenName:(NSString *)screenName;

- (void)trackStayDurationWithCategory:(NSString *)category screenNames:(NSArray *)screenNames;

- (void)trackEventWithCategory:(NSString *)category action:(NSString *)action label:(NSString *)label value:(NSNumber *)value;

- (void)trackException:(NSException *)exception;

- (void)trackError:(NSError *)error;

- (void)trackMemoryWarning;


#pragma -mark Util

- (NSString *)getScreenNameFromObject:(id)object;

- (NSString *)getScreenNameFromClass:(Class)oneClass;

#pragma -mark Macro

#define TrackScreen(screenName) [[CUTETracker sharedInstance] trackScreen:screenName]

#define TrackScreenStayDuration(category, oneScreenName) [[CUTETracker sharedInstance] trackStayDurationWithCategory:category screenName:oneScreenName]

#define TrackScreensStayDuration(category, oneScreenNames) [[CUTETracker sharedInstance] trackStayDurationWithCategory:category screenNames:oneScreenNames]

#define TrackEvent(oneCategory, oneAction, oneLabel, oneValue)  [[CUTETracker sharedInstance] trackEventWithCategory:oneCategory action:oneAction label:oneLabel value:oneValue]

#define GetScreenName(object) [[CUTETracker sharedInstance] getScreenNameFromObject:object]

#define GetScreenNameFromClass(oneClass) [[CUTETracker sharedInstance] getScreenNameFromClass:oneClass]

@end
