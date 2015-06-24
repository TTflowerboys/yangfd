//
//  CUTESurveyHelper.m
//  currant
//
//  Created by Foster Yin on 6/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTESurveyHelper.h"
#import "CUTEUsageRecorder.h"
#import "ATConnect.h"
#import "NSDate-Utilities.h"

@implementation CUTESurveyHelper

+ (BOOL)isAppUsageOverDays:(NSUInteger)days {
    NSDate *firstDate = [NSDate dateWithTimeIntervalSince1970:[[CUTEUsageRecorder sharedInstance] getFirstEnterForegroundTime]];
    NSDate *lastDate = [NSDate dateWithTimeIntervalSince1970:[[CUTEUsageRecorder sharedInstance] getLastEnterForegroundTime]];
    return [firstDate daysBeforeDate:lastDate] > days;
}

+ (void)checkShowPublishedRentTicketSurveyWithViewController:(UIViewController *)viewController {
    if ([CUTESurveyHelper isAppUsageOverDays:7]) {
        if ([[CUTEUsageRecorder sharedInstance] getPublishedTicketCount] > 0) {
            [[ATConnect sharedConnection] engage:@"survey_after_7_days_and_have_published_ticket" fromViewController:viewController];
        }
        else {
            [[ATConnect sharedConnection] engage:@"survey_after_7_days_and_have_not_published_ticket" fromViewController:viewController];
        }
    }
}

+ (void)checkShowFavoriteRentTicketSurveyWithViewController:(UIViewController *)viewController {
    if ([CUTESurveyHelper isAppUsageOverDays:7]) {
        if ([[CUTEUsageRecorder sharedInstance] getFavoriteTicketCount] > 0) {
            if ([[CUTEUsageRecorder sharedInstance] getPublishedTicketCount] == 0) {
                [[ATConnect sharedConnection] engage:@"survey_after_7_days_and_have_favorite_ticket" fromViewController:viewController];
            }
        }
    }
}

@end
