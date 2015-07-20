//
//  CUTETracker.m
//  currant
//
//  Created by Foster Yin on 5/13/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETracker.h"
#import <Google/Analytics.h>
#import "CUTEDataManager.h"
#import "NSString+SLRESTfulCoreData.h"
#import "CUTECommonMacro.h"
#import "CUTEDataManager.h"
#import <NSArray+ObjectiveSugar.h>
#import "MemoryReporter.h"
#import "CUTEUsageRecorder.h"

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
//    [[[GAI sharedInstance] logger] setLogLevel:kGAILogLevelVerbose];

    // Initialize tracker. Replace with your tracking ID.
    _tracker = [GAI sharedInstance].defaultTracker;

    // Task #6907 need this IDFA collection
    //_tracker.allowIDFACollection = YES;
}

- (void)setupCommonParams:(GAIDictionaryBuilder *)builder {
    if (!IsNilNullOrEmpty([CUTEDataManager sharedInstance].user.identifier)) {
        [builder set:[CUTEDataManager sharedInstance].user.identifier forKey:kGAIUserId];
    }
}

- (void)trackScreen:(NSString *)screenName {
    GAIDictionaryBuilder *builder = [GAIDictionaryBuilder createScreenView];
    [self setupCommonParams:builder];
    [builder set:screenName forKey:kGAIScreenName];
    [_tracker send:[builder build]];
    [[CUTEUsageRecorder sharedInstance] saveScreen:screenName lastVisitTime:[NSDate date].timeIntervalSince1970];
}


- (void)trackStayDurationWithCategory:(NSString *)category screenName:(NSString *)screenName {
    NSTimeInterval startTime = [[CUTEUsageRecorder sharedInstance] getScreenLastVistiTime:screenName];
    NSTimeInterval endTime = [NSDate date].timeIntervalSince1970;

    GAIDictionaryBuilder *builder = [GAIDictionaryBuilder createTimingWithCategory:category interval:@((NSUInteger)((endTime - startTime) * 1000)) name:kEventActionStay label:screenName];
    [self setupCommonParams:builder];
    [_tracker send:builder.build];
}

- (void)trackStayDurationWithCategory:(NSString *)category screenNames:(NSArray *)screenNames {
    __block NSTimeInterval totalTime = 0;
    NSMutableString *label = [NSMutableString stringWithString:@"total"];
    [screenNames each:^(NSString* screenName) {
        NSTimeInterval startTime = [[CUTEUsageRecorder sharedInstance] getScreenLastVistiTime:screenName];
        NSTimeInterval endTime = [NSDate date].timeIntervalSince1970;
        totalTime += (endTime - startTime);
        [label appendString:@":"];
        [label appendString:screenName];
    }];

    GAIDictionaryBuilder *builder = [GAIDictionaryBuilder createTimingWithCategory:category interval:@((NSUInteger)(totalTime * 1000)) name:kEventActionStay label:label];
    [self setupCommonParams:builder];
    [_tracker send:builder.build];
}


- (void)trackEventWithCategory:(NSString *)category action:(NSString *)action label:(NSString *)label value:(NSNumber *)value {
    GAIDictionaryBuilder *builder = [GAIDictionaryBuilder createEventWithCategory:category action:action label:label value:value];
    [self setupCommonParams:builder];
    [_tracker send:[builder build]];
}

- (void)trackException:(NSException *)exception {
    GAIDictionaryBuilder *builder = [GAIDictionaryBuilder createExceptionWithDescription:exception.description withFatal:@(0)];
    [self setupCommonParams:builder];
    [_tracker send:builder.build];
}

- (void)trackError:(NSError *)error {
    GAIDictionaryBuilder *builder = [GAIDictionaryBuilder createExceptionWithDescription:error.description withFatal:@(0)];
    [self setupCommonParams:builder];
    [_tracker send:builder.build];
}

- (void)trackMemoryWarning {
    long usedMemory = 0;
    NSString *label = GetMemUsage(&usedMemory);
    [self trackEventWithCategory:KEventCategorySystem action:kEventActionMemoryWarning label:label value:@(usedMemory)];
}

- (void)trackEnterForeground {
    NSDate *date = [NSDate new];
    [[CUTEUsageRecorder sharedInstance] saveEnterForegroundTime:date.timeIntervalSince1970];
    [self trackEventWithCategory:KEventCategoryUsage action:kEventActionEnterForeground label:date.description value:@(date.timeIntervalSince1970)];
}

- (NSString *)getScreenNameFromObject:(id)object {

    if ([object isKindOfClass:[UIViewController class]]) {
        return [self getScreenNameFromViewController:object];
    }
    else if ([object isKindOfClass:[NSURL class]]) {
        return [self getScreenNameFromURL:object];
    }
    else if ([object isKindOfClass:[NSString class]]) {
        return object;
    }
    return [object description];
}

- (NSString *)getScreenNameFromClass:(Class)class {
    NSString *screenName = NSStringFromClass(class);
    if ([screenName hasPrefix:@"CUTE"]) {
        screenName = [screenName substringFromIndex:4];
    }
    if ([screenName hasSuffix:@"ViewController"]) {
        screenName = [screenName substringToIndex:screenName.length - @"ViewController".length];
    }

    screenName = [[screenName stringByUnderscoringString] stringByReplacingOccurrencesOfString:@"_" withString:@"-"];
    return screenName;
}

- (NSString *)getScreenNameFromViewController:(UIViewController *)controller {
    return [self getScreenNameFromClass:[controller class]];

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
