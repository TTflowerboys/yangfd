//
//  CUTESurveyHelper.h
//  currant
//
//  Created by Foster Yin on 6/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface CUTESurveyHelper : NSObject

+ (void)checkShowPublishedRentTicketSurveyWithViewController:(UIViewController *)viewController;

+ (void)checkShowFavoriteRentTicketSurveyWithViewController:(UIViewController *)viewController;

+ (void)checkShowUserVisitManyRentTicketSurveyWithViewController:(UIViewController *)viewController;

+ (void)checkShowRentTicketDidBeRentedSurveyWithViewController:(UIViewController *)viewController;

@end
