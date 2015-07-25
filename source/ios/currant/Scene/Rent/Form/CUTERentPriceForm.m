//
//  CUTERentPriceForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPriceForm.h"
#import "CUTECommonMacro.h"
#import "CUTEFormRentPriceTextFieldCell.h"
#import "CUTECurrency.h"
#import "CUTEFormTextFieldCell.h"
#import "CUTEFormDatePickerCell.h"
#import "CUTEFormDefaultCell.h"
#import "CUTEFormSwitchCell.h"
#import "CUTEFormRentPeriodPickerCell.h"
#import "CUTEFormCurrencyTextFieldCell.h"

@interface CUTERentPriceForm () {

    NSArray *_allRentPeriods;
}

@end

@implementation CUTERentPriceForm

- (NSArray *)fields {
    NSMutableArray *array = [NSMutableArray arrayWithArray:
                             @[
                               @{FXFormFieldKey: @"currency", FXFormFieldTitle:STR(@"货币"), FXFormFieldOptions: [CUTECurrency currencyUnitArray], FXFormFieldDefaultValue: _currency ? : [CUTECurrency defaultCurrencyUnit], FXFormFieldHeader: STR(@"租金"), FXFormFieldAction: @"onCurrencyEdit:"},
                               @{FXFormFieldKey: @"rentPrice", FXFormFieldTitle:STR(@"租金"), FXFormFieldType:FXFormFieldTypeFloat, FXFormFieldCell: [CUTEFormRentPriceTextFieldCell class], FXFormFieldDefaultValue: @(_rentPrice), @"textField.keyboardType": @(UIKeyboardTypeDecimalPad), FXFormFieldAction: @"onRentPriceEdit:"},
                               @{FXFormFieldKey: @"deposit", FXFormFieldTitle:STR(@"押金"), FXFormFieldType:FXFormFieldTypeFloat, FXFormFieldCell: [CUTEFormCurrencyTextFieldCell class], @"textField.keyboardType": @(UIKeyboardTypeDecimalPad),FXFormFieldHeader: @"", FXFormFieldPlaceholder: STR(@"如不填写则默认为面议"), FXFormFieldAction: @"onDepositEdit:"},
                               @{FXFormFieldKey: @"billCovered", FXFormFieldTitle:STR(@"包Bill"), FXFormFieldHeader: STR(@"其他"), FXFormFieldDefaultValue: @(_billCovered), FXFormFieldAction: @"onBillCoveredSwitch:", FXFormFieldCell: [CUTEFormSwitchCell class]},
                               @{FXFormFieldKey: @"needSetPeriod", FXFormFieldTitle:STR(@"设置租期"), FXFormFieldHeader: STR(@"租期"), FXFormFieldDefaultValue: @(_needSetPeriod), FXFormFieldAction: @"onRentPeriodSwitch:", FXFormFieldCell: [CUTEFormSwitchCell class]},
                               ]];
    if (self.needSetPeriod) {
        [array addObject:@{FXFormFieldKey: @"rentAvailableTime", FXFormFieldTitle:STR(@"开始日期"), FXFormFieldDefaultValue: _rentAvailableTime? : [NSDate new], FXFormFieldAction: @"onRentAvailableTimeEdit:", FXFormFieldCell: [CUTEFormDatePickerCell class]}];
        [array addObject:@{FXFormFieldKey: @"rentDeadlineTime", FXFormFieldTitle:STR(@"结束日期"), FXFormFieldAction: @"onRentDeadlineTimeEdit:", FXFormFieldCell: [CUTEFormDatePickerCell class]}];
        [array addObject:@{FXFormFieldKey: @"minimumRentPeriod", FXFormFieldTitle: @"最短接受租期", FXFormFieldCell: [CUTEFormRentPeriodPickerCell class], @"style": @(UITableViewCellStyleValue1), FXFormFieldAction: @"onMinimumRentPeriodEdit:"}];
    }
    return array;
}

- (NSString *)currencySymbol {
    return [CUTECurrency symbolOfCurrencyUnit:self.currency];
}

- (void)setRentDeadlineTime:(NSDate *)rentDeadlineTime {
    _rentDeadlineTime = rentDeadlineTime;
}

- (NSError *)validateFormWithScenario:(NSString *)scenario {
    NSError *error = nil;
    [NGRValidator validateModel:self error:&error delegate:nil rules:^NSArray *{
        return @[NGRValidate(@"rentPrice").required().min(FLT_EPSILON),
                 ];
    }];
    return error;
}



@end
