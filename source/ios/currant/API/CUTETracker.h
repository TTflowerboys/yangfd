//
//  CUTETracker.h
//  currant
//
//  Created by Foster Yin on 5/13/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>

#define kEventActionPress @"press"

#define TrackScreen(screenName) [[CUTETracker sharedInstance] trackScreen:screenName]
#define TrackEvent(category, action, label, value) [[CUTETracker sharedInstance] trackEventWithCategory:category action:action label:label value:value]

@interface CUTETracker : NSObject

+ (instancetype)sharedInstance;

- (void)setup;

- (void)trackScreen:(NSString *)screenName;

- (void)trackEventWithCategory:(NSString *)category action:(NSString *)action label:(NSString *)label value:(NSNumber *)value;

@end
