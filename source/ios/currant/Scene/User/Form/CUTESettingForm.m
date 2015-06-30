//
//  CUTESettingForm.m
//  currant
//
//  Created by Foster Yin on 6/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTESettingForm.h"
#import "CUTECommonMacro.h"
#import "CUTEFormTextCell.h"

@implementation CUTESettingForm

- (NSArray *)fields {
    NSMutableArray *array = [NSMutableArray arrayWithArray:
                             @[
                               @{FXFormFieldKey: @"version", FXFormFieldTitle:STR(@"版本"), @"style": @(UITableViewCellStyleValue1), FXFormFieldHeader: @""},
                               @{FXFormFieldKey: @"feedback", FXFormFieldTitle:STR(@"意见反馈"), FXFormFieldAction: @"onFeedBackPressed:", @"style": @(UITableViewCellStyleValue1)},
                               @{FXFormFieldKey: @"rate", FXFormFieldTitle:STR(@"觉得不错？去App Store评价"), @"style": @(UITableViewCellStyleValue1), FXFormFieldAction: @"onRatePressed:"},
//                               @{FXFormFieldKey: @"survey", FXFormFieldTitle:STR(@"用户调查"), @"style": @(UITableViewCellStyleValue1), FXFormFieldAction: @"onSurveyPressed:"},
                               ]];
    return array;
}

@end
