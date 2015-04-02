//
//  CUTERentPriceForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPriceForm.h"
#import "CUTECommonMacro.h"

@implementation CUTERentPriceForm

- (NSArray *)cuteFields {
    return @[
             @{FXFormFieldKey: @"currency", FXFormFieldTitle:STR(@"货币"), FXFormFieldOptions: @[@"CNY", @"GBP", @"USD", @"EUR", @"HKD"], FXFormFieldDefaultValue: @"CNY", FXFormFieldHeader: STR(@"租金")},
                @{FXFormFieldKey: @"deposit", FXFormFieldTitle:STR(@"押金"), FXFormFieldOptions: @[STR(@"面议"), STR(@"押三付一")], FXFormFieldDefaultValue: STR(@"面议"),},
             @{FXFormFieldKey: @"rentPrice", FXFormFieldTitle:STR(@"租金")},
                @{FXFormFieldKey: @"containBill", FXFormFieldTitle:STR(@"包Bill"), FXFormFieldHeader: STR(@"其他")},
                @{FXFormFieldKey: @"needSetDuration", FXFormFieldTitle:STR(@"设置租期"), FXFormFieldHeader: STR(@"租期")},
             ];
}


@end
