//
//  CUTERentPriceForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPriceForm.h"
#import "CUTECommonMacro.h"

@interface CUTERentPriceForm () {
    NSArray *_allDepositTypes;

    NSArray *_allRentPeriods;
}

@end

@implementation CUTERentPriceForm

- (NSArray *)fields {
    NSMutableArray *array = [NSMutableArray arrayWithArray:
                             @[
                               @{FXFormFieldKey: @"currency", FXFormFieldTitle:STR(@"货币"), FXFormFieldOptions: @[@"CNY", @"GBP", @"USD", @"EUR", @"HKD"], FXFormFieldDefaultValue: @"CNY", FXFormFieldHeader: STR(@"租金")},
                               @{FXFormFieldKey: @"depositType", FXFormFieldTitle:STR(@"押金"), FXFormFieldOptions: _allDepositTypes, FXFormFieldDefaultValue: [_allDepositTypes firstObject],},
                               @{FXFormFieldKey: @"rentPrice", FXFormFieldTitle:STR(@"租金"), FXFormFieldType:FXFormFieldTypeFloat},
                               @{FXFormFieldKey: @"containBill", FXFormFieldTitle:STR(@"包Bill"), FXFormFieldHeader: STR(@"其他")},
                               @{FXFormFieldKey: @"needSetPeriod", FXFormFieldTitle:STR(@"设置租期"), FXFormFieldHeader: STR(@"租期"), FXFormFieldAction: @"setRentPeriod"},
                               ]];
    if (self.needSetPeriod) {
        [array addObject:@{FXFormFieldKey: @"startDate", FXFormFieldTitle:STR(@"开始日期"), FXFormFieldDefaultValue: [NSDate new]}];
        [array addObject:@{FXFormFieldKey: @"租期", FXFormFieldOptions: _allRentPeriods, FXFormFieldDefaultValue: [_allRentPeriods firstObject]}];
    }
    return array;
}

- (void)setAllDepositTypes:(NSArray *)depositTypes {
    _allDepositTypes = depositTypes;
}

- (void)setAllRentPeriods:(NSArray *)rentPeriods {
    _allRentPeriods = rentPeriods;
}


@end
