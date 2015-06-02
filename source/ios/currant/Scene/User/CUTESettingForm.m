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
                               @{FXFormFieldKey: @"rate", FXFormFieldTitle:STR(@"评分"), @"style": @(UITableViewCellStyleValue1), FXFormFieldAction: @"onRatePressed:"},
                               ]];
    return array;
}

@end
