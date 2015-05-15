//
//  CUTETracker.m
//  currant
//
//  Created by Foster Yin on 5/13/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETracker.h"
#import <GAI.h>
#import <GAIDictionaryBuilder.h>
#import <GAITracker.h>
#import <GAIFields.h>
#import "CUTEDataManager.h"
#import "NSString+SLRESTfulCoreData.h"
#import "CUTECommonMacro.h"

@interface CUTETracker ()
{
    id<GAITracker> _tracker;
}

@end

@implementation CUTETracker

+ (instancetype)sharedInstance
{
    static dispatch_once_t pred;
    __strong static id sharedInstance = nil;

    dispatch_once(&pred, ^{
        sharedInstance = [[[self class] alloc] init];
    });

    return sharedInstance;
}

- (void)setup {
    // Optional: automatically send uncaught exceptions to Google Analytics.
    [GAI sharedInstance].trackUncaughtExceptions = YES;

    // Optional: set Google Analytics dispatch interval to e.g. 20 seconds.
    [GAI sharedInstance].dispatchInterval = 20;

    // Optional: set Logger to VERBOSE for debug information.
    [[[GAI sharedInstance] logger] setLogLevel:kGAILogLevelVerbose];

    // Initialize tracker. Replace with your tracking ID.
    _tracker = [[GAI sharedInstance] trackerWithTrackingId:@"UA-55542465-2"];

}

- (void)trackScreen:(NSString *)screenName {
    GAIDictionaryBuilder *builder = [GAIDictionaryBuilder createScreenView];
    [builder set:screenName forKey:kGAIScreenName];
    [builder set:[CUTEDataManager sharedInstance].user.identifier forKey:kGAIUserId];
    [_tracker send:[builder build]];

}


- (void)trackEventWithCategory:(NSString *)category action:(NSString *)action label:(NSString *)label value:(NSNumber *)value {
    GAIDictionaryBuilder *builder = [GAIDictionaryBuilder createEventWithCategory:category action:action label:label value:value];
    [builder set:[CUTEDataManager sharedInstance].user.identifier forKey:kGAIUserId];
    [_tracker send:[builder build]];
}

- (void)trackException:(NSException *)exception {
    GAIDictionaryBuilder *builder = [GAIDictionaryBuilder createExceptionWithDescription:exception.description withFatal:@(0)];
    [_tracker send:builder.build];
}

- (NSString *)getScreenNameFromObject:(id)object {

    if ([object isKindOfClass:[UIViewController class]]) {
        return [self getScreenNameFromViewController:object];
    }
    else if ([object isKindOfClass:[NSURL class]]) {
        return [self getScreenNameFromURL:object];
    }
    return [object description];
}

- (NSString *)getScreenNameFromViewController:(UIViewController *)controller {
    NSString *screenName = NSStringFromClass([controller class]);
    if ([screenName hasPrefix:@"CUTE"]) {
        screenName = [screenName substringFromIndex:4];
    }
    if ([screenName hasSuffix:@"ViewController"]) {
        screenName = [screenName substringToIndex:screenName.length - @"ViewController".length];
    }

    screenName = [[screenName stringByUnderscoringString] stringByReplacingOccurrencesOfString:@"_" withString:@"-"];
    return screenName;

}

- (NSString *)getScreenNameFromURL:(NSURL *)url {
    if (url) {
        NSArray *paths = [[url path] componentsSeparatedByString:@"/"];
        if (paths.count >= 2) {
            NSString *screenName = !IsNilNullOrEmpty(paths[1])? [paths[1] stringByReplacingOccurrencesOfString:@"_" withString:@"-"]: @"index";
            return screenName;
        }
    }
    return nil;
}

@end
