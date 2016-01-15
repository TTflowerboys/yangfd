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

+ (instancetype __nonnull)sharedInstance;

- (void)setup;

- (void)trackScreen:(NSString * __nonnull)screenName;

- (void)trackStayDurationWithCategory:(NSString * __nonnull)category screenName:(NSString * __nonnull)screenName;

- (void)trackStayDurationWithCategory:(NSString * __nonnull)category screenNames:(NSArray * __nonnull)screenNames;

- (void)trackEventWithCategory:(NSString * __nonnull)category action:(NSString * __nullable)action label:(NSString * __nullable)label value:(NSNumber * __nullable)value;

- (void)trackException:(NSException * __nonnull)exception;

- (void)trackError:(NSError * __nonnull)error;

- (void)trackMemoryWarning;

- (void)trackEnterForeground;


#pragma -mark Util

- (NSString * __nullable)getScreenNameFromObject:(id __nonnull)object;

- (NSString * __nullable)getScreenNameFromClass:(Class __nonnull)oneClass;

#pragma -mark Macro

#define TrackScreen(screenName) [[CUTETracker sharedInstance] trackScreen:screenName]

#define TrackScreenStayDuration(category, oneScreenName) [[CUTETracker sharedInstance] trackStayDurationWithCategory:category screenName:oneScreenName]

#define TrackScreensStayDuration(category, oneScreenNames) [[CUTETracker sharedInstance] trackStayDurationWithCategory:category screenNames:oneScreenNames]

#define TrackEvent(oneCategory, oneAction, oneLabel, oneValue)  [[CUTETracker sharedInstance] trackEventWithCategory:oneCategory action:oneAction label:oneLabel value:oneValue]

#define GetScreenName(object) [[CUTETracker sharedInstance] getScreenNameFromObject:object]

#define GetScreenNameFromClass(oneClass) [[CUTETracker sharedInstance] getScreenNameFromClass:oneClass]

@end
