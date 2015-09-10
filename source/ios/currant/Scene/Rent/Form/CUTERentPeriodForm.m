//
//  CUTERentPeriodForm.m
//  currant
//
//  Created by Foster Yin on 7/29/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPeriodForm.h"
#import "CUTEFormSwitchCell.h"
#import "CUTEFormDatePickerCell.h"
#import "CUTEFormRentPeriodPickerCell.h"
#import "CUTECommonMacro.h"

@implementation CUTERentPeriodForm

- (NSArray *)fields {
    NSMutableArray *array = [NSMutableArray arrayWithArray:
                             @[
                               @{FXFormFieldKey: @"needSetPeriod", FXFormFieldTitle:STR(@"RentPeriod/设置租期"), FXFormFieldHeader: STR(@"RentPeriod/租期"), FXFormFieldDefaultValue: @(_needSetPeriod), FXFormFieldAction: @"onRentPeriodSwitch:", FXFormFieldCell: [CUTEFormSwitchCell class]},
                               ]];
    if (self.needSetPeriod) {
        [array addObject:@{FXFormFieldKey: @"rentAvailableTime", FXFormFieldTitle:STR(@"RentPeriod/开始日期"), FXFormFieldDefaultValue: _rentAvailableTime? : [NSDate new], FXFormFieldAction: @"onRentAvailableTimeEdit:", FXFormFieldCell: [CUTEFormDatePickerCell class]}];
        [array addObject:@{FXFormFieldKey: @"rentDeadlineTime", FXFormFieldTitle:STR(@"RentPeriod/结束日期"), FXFormFieldAction: @"onRentDeadlineTimeEdit:", FXFormFieldCell: [CUTEFormDatePickerCell class]}];
        [array addObject:@{FXFormFieldKey: @"minimumRentPeriod", FXFormFieldTitle: @"最短接受租期", FXFormFieldCell: [CUTEFormRentPeriodPickerCell class], @"style": @(UITableViewCellStyleValue1), FXFormFieldAction: @"onMinimumRentPeriodEdit:"}];
    }
    return array;
}

@end
