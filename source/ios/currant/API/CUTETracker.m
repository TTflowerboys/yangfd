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
#import "CUTEConfiguration.h"

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

#ifdef DEBUG
//    [[[GAI sharedInstance] logger] setLogLevel:kGAILogLevelVerbose];
#endif

    // Initialize tracker. Replace with your tracking ID.
    _tracker = [GAI sharedInstance].defaultTracker;
    NSAssert(_tracker != nil, @"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,@"");


    // Task #6907 need this IDFA collection
    //_tracker.allowIDFACollection = YES;
}

- (void)setupCommonParams:(GAIDictionaryBuilder *)builder {
    if (!IsNilNullOrEmpty([CUTEDataManager sharedInstance].user.identifier)) {
        [builder set:[CUTEDataManager sharedInstance].user.identifier forKey:kGAIUserId];
    }
    [builder set:[CUTEConfiguration host] forKey:kGAIHostname];
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
#ifdef DEBUG
    NSAssert(!fequalzero(startTime), @"[%@|%@|%d] %@ %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ , screenName, @"Start time should not be zero");
#endif
    NSTimeInterval endTime = [NSDate date].timeIntervalSince1970;
    NSNumber *interval = @((NSUInteger)((endTime - startTime) * 1000));

    [self trackTimingWithCategory:category action:kEventActionStay label:screenName interval:interval];
    [self trackEventWithCategory:category action:kEventActionStay label:screenName value:interval];
}

- (void)trackStayDurationWithCategory:(NSString *)category screenNames:(NSArray *)screenNames {
    NSTimeInterval startTime = [[CUTEUsageRecorder sharedInstance] getScreenLastVistiTime:screenNames.firstObject];
#ifdef DEBUG
    NSAssert(!fequalzero(startTime), @"[%@|%@|%d] %@ %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ , screenNames.firstObject, @"Start time should not be zero");
#endif
    NSTimeInterval totalTime = [[NSDate date] timeIntervalSince1970] - startTime;
    NSMutableString *label = [NSMutableString stringWithString:@"total"];
    [screenNames each:^(NSString* screenName) {
        [label appendString:@":"];
        [label appendString:screenName];
    }];
    NSNumber *interval = @((NSUInteger)(totalTime * 1000));

    [self trackTimingWithCategory:category action:kEventActionStay label:label interval:interval];
    [self trackEventWithCategory:category action:kEventActionStay label:label value:interval];
}

- (void)trackTimingWithCategory:(NSString *)category action:(NSString *)action label:(NSString *)label interval:(NSNumber *)interval {
    GAIDictionaryBuilder *builder = [GAIDictionaryBuilder createTimingWithCategory:category interval:interval name:action label:label];
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
