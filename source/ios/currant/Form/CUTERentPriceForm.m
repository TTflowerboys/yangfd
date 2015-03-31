//
//  CUTERentPriceForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPriceForm.h"

@implementation CUTERentPriceForm

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"currency", FXFormFieldOptions: @[@"CNY", @"GBP", @"USD", @"EUR", @"HKD"], FXFormFieldDefaultValue: @"CNY", FXFormFieldHeader: STR(@"租金")},
                @{FXFormFieldKey: @"deposit", FXFormFieldOptions: @[STR(@"面议"), STR(@"押三付一")], FXFormFieldDefaultValue: STR(@"面议"),},
             @{FXFormFieldKey: @"rentPrice"},
                @{FXFormFieldKey: @"containBill", FXFormFieldHeader: STR(@"其他")},
                @{FXFormFieldKey: @"needSetDuration", FXFormFieldHeader: STR(@"租期")},
             ];
}


@end
