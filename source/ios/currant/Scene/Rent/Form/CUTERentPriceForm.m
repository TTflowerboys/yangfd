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

@interface CUTERentPriceForm () {

    NSArray *_allDepositTypes;

    NSArray *_allRentPeriods;
}

@end

@implementation CUTERentPriceForm

- (NSArray *)fields {
    NSMutableArray *array = [NSMutableArray arrayWithArray:
                             @[
                               @{FXFormFieldKey: @"currency", FXFormFieldTitle:STR(@"货币"), FXFormFieldOptions: [CUTECurrency currencyUnitArray], FXFormFieldDefaultValue: _currency ? : [CUTECurrency defaultCurrencyUnit], FXFormFieldHeader: STR(@"租金"), FXFormFieldAction: @"optionBack"},
                               @{FXFormFieldKey: @"depositType", FXFormFieldTitle:STR(@"押金"), FXFormFieldOptions: _allDepositTypes, FXFormFieldDefaultValue: _depositType? : [_allDepositTypes firstObject], FXFormFieldAction: @"optionBack"},
                               @{FXFormFieldKey: @"rentPrice", FXFormFieldTitle:STR(@"租金"), FXFormFieldType:FXFormFieldTypeFloat, FXFormFieldCell: [CUTEFormRentPriceTextFieldCell class], FXFormFieldDefaultValue: @(_rentPrice), @"textField.keyboardType": @(UIKeyboardTypeDecimalPad), FXFormFieldAction: @"onRentPriceEdit:"},
                               @{FXFormFieldKey: @"containBill", FXFormFieldTitle:STR(@"包Bill"), FXFormFieldHeader: STR(@"其他"), FXFormFieldDefaultValue: @(_containBill), FXFormFieldAction: @"onContainBillSwitch:"},
                               @{FXFormFieldKey: @"needSetPeriod", FXFormFieldTitle:STR(@"设置租期"), FXFormFieldHeader: STR(@"租期"), FXFormFieldDefaultValue: @(_needSetPeriod), FXFormFieldAction: @"onRentPeriodSwitch:"},
                               ]];
    if (self.needSetPeriod) {
        [array addObject:@{FXFormFieldKey: @"rentAvailableTime", FXFormFieldTitle:STR(@"开始日期"), FXFormFieldDefaultValue: _rentAvailableTime? : [NSDate new], FXFormFieldAction: @"onRentAvailableTimeEdit:", FXFormFieldCell: [CUTEFormDatePickerCell class]}];
        [array addObject:@{FXFormFieldKey: @"rentPeriod", FXFormFieldTitle: @"租期", FXFormFieldOptions: _allRentPeriods, FXFormFieldDefaultValue: _rentPeriod? : [_allRentPeriods firstObject], FXFormFieldAction: @"optionBack"}];
    }
    return array;
}

- (NSString *)currencySymbol {
    return [CUTECurrency symbolOfCurrencyUnit:self.currency];
}

- (void)setAllDepositTypes:(NSArray *)depositTypes {
    _allDepositTypes = depositTypes;
}

- (void)setAllRentPeriods:(NSArray *)rentPeriods {
    _allRentPeriods = rentPeriods;
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
