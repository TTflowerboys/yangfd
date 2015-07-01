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
#import "CUTEApptentiveEvent.h"

@implementation CUTESurveyHelper

+ (BOOL)isAppUsageOverDays:(NSUInteger)days {
    return [[CUTEUsageRecorder sharedInstance] getUsageDays] > days;
}

+ (void)checkShowPublishedRentTicketSurveyWithViewController:(UIViewController *)viewController {
    if ([[CUTEUsageRecorder sharedInstance] isApptentiveEventTriggered:APPTENTIVE_EVENT_SURVEY_AFTER_7_DAYS_AND_HAVE_PUBLISHED_TICKET] || [[CUTEUsageRecorder sharedInstance] isApptentiveEventTriggered:APPTENTIVE_EVENT_SURVEY_AFTER_7_DAYS_AND_HAVE_NOT_PUBLISHED_TICKET]) {
        if ([CUTESurveyHelper isAppUsageOverDays:7]) {
            if ([[CUTEUsageRecorder sharedInstance] getPublishedTicketCount] > 0) {
                if ([[ATConnect sharedConnection] engage:APPTENTIVE_EVENT_SURVEY_AFTER_7_DAYS_AND_HAVE_PUBLISHED_TICKET fromViewController:viewController]) {
                    [[CUTEUsageRecorder sharedInstance] saveApptentiveEventTriggered:APPTENTIVE_EVENT_SURVEY_AFTER_7_DAYS_AND_HAVE_PUBLISHED_TICKET];
                }
            }
            else {
                if ([[ATConnect sharedConnection] engage:APPTENTIVE_EVENT_SURVEY_AFTER_7_DAYS_AND_HAVE_NOT_PUBLISHED_TICKET fromViewController:viewController]) {
                    [[CUTEUsageRecorder sharedInstance] saveApptentiveEventTriggered:APPTENTIVE_EVENT_SURVEY_AFTER_7_DAYS_AND_HAVE_NOT_PUBLISHED_TICKET];
                }
            }
        }
    }
}

+ (void)checkShowFavoriteRentTicketSurveyWithViewController:(UIViewController *)viewController {
    if ([[CUTEUsageRecorder sharedInstance] isApptentiveEventTriggered:APPTENTIVE_EVENT_SURVEY_AFTER_7_DAYS_AND_HAVE_FAVORITE_TICKET]) {
        if ([CUTESurveyHelper isAppUsageOverDays:7]) {
            if ([[CUTEUsageRecorder sharedInstance] getFavoriteTicketCount] > 0) {
                if ([[CUTEUsageRecorder sharedInstance] getPublishedTicketCount] == 0) {
                    if ([[ATConnect sharedConnection] engage:APPTENTIVE_EVENT_SURVEY_AFTER_7_DAYS_AND_HAVE_FAVORITE_TICKET fromViewController:viewController]) {
                        [[CUTEUsageRecorder sharedInstance] saveApptentiveEventTriggered:APPTENTIVE_EVENT_SURVEY_AFTER_7_DAYS_AND_HAVE_FAVORITE_TICKET];
                    }
                }
            }
        }
    }
}

+ (void)checkShowUserVisitManyRentTicketSurveyWithViewController:(UIViewController *)viewController {
    if (![[CUTEUsageRecorder sharedInstance] isApptentiveEventTriggered:APPTENTIVE_EVENT_SURVEY_AFTER_USER_VISIT_MANY_RENT_TICKET]) {
        if ([[CUTEUsageRecorder sharedInstance] getVisitedTicketCount] >= 7) {
            if ([[ATConnect sharedConnection] engage:APPTENTIVE_EVENT_SURVEY_AFTER_USER_VISIT_MANY_RENT_TICKET fromViewController:viewController]) {
                [[CUTEUsageRecorder sharedInstance] saveApptentiveEventTriggered:APPTENTIVE_EVENT_SURVEY_AFTER_USER_VISIT_MANY_RENT_TICKET];
            }
        }
    }
}

+ (void)checkShowRentTicketDidBeRentedSurveyWithViewController:(UIViewController *)viewController {
    if (![[CUTEUsageRecorder sharedInstance] isApptentiveEventTriggered:APPTENTIVE_EVENT_SURVEY_AFTER_RENT_TICKET_IS_RENTED]) {
        if ([[ATConnect sharedConnection] engage:APPTENTIVE_EVENT_SURVEY_AFTER_RENT_TICKET_IS_RENTED fromViewController:viewController]) {
            [[CUTEUsageRecorder sharedInstance] saveApptentiveEventTriggered:APPTENTIVE_EVENT_SURVEY_AFTER_RENT_TICKET_IS_RENTED];
        }
    }
}

@end
