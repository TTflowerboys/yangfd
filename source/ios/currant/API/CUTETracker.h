//
//  CUTETracker.h
//  currant
//
//  Created by Foster Yin on 5/13/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#define kEventActionPress @"press"
#define kEventActionRequestReturn @"request-return"

#define TrackScreen(screenName) [[CUTETracker sharedInstance] trackScreen:screenName]
#define TrackEvent(oneCategory, oneAction, oneLabel, oneValue)  [[CUTETracker sharedInstance] trackEventWithCategory:oneCategory action:oneAction label:oneLabel value:oneValue]

#define GetScreenName(object) [[CUTETracker sharedInstance] getScreenNameFromObject:object]

@interface CUTETracker : NSObject

+ (instancetype)sharedInstance;

- (void)setup;

- (void)trackScreen:(NSString *)screenName;

- (void)trackEventWithCategory:(NSString *)category action:(NSString *)action label:(NSString *)label value:(NSNumber *)value;

#pragma Util

- (NSString *)getScreenNameFromObject:(id)object;

@end
