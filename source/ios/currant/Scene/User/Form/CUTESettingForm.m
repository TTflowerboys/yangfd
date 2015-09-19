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

@interface CUTESettingForm () {

    NSArray *_localizations;

}

@end


@implementation CUTESettingForm

- (NSArray *)fields {
    NSMutableArray *array = [NSMutableArray arrayWithArray:
                             @[
                               @{FXFormFieldKey: @"version", FXFormFieldTitle:STR(@"Setting/版本"), @"style": @(UITableViewCellStyleValue1), FXFormFieldHeader: @""},
                               @{FXFormFieldKey: @"feedback", FXFormFieldTitle:STR(@"Setting/意见反馈"), FXFormFieldAction: @"onFeedBackPressed:", @"style": @(UITableViewCellStyleValue1)},
                               @{FXFormFieldKey: @"help", FXFormFieldTitle:STR(@"Setting/帮助中心"), FXFormFieldAction: @"onHelpPressed:", @"style": @(UITableViewCellStyleValue1)},
                               @{FXFormFieldKey: @"rate", FXFormFieldTitle:STR(@"Setting/觉得不错？去App Store评价"), @"style": @(UITableViewCellStyleValue1), FXFormFieldAction: @"onRatePressed:"},
                               @{FXFormFieldKey: @"localization", FXFormFieldTitle:STR(@"Setting/语言"), FXFormFieldOptions:_localizations, FXFormFieldAction: @"onLocalizationSelected:", FXFormFieldHeader: @""},
                               ]];
    return array;
}

- (void)setLocalizations:(NSArray *)localizations {
    _localizations = localizations;
}

@end
