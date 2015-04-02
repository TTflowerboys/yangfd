//
//  CUTERectTypeListForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERectTypeListForm.h"
#import "CUTECommonMacro.h"
#import "CUTEFormRentTypeCell.h"
#import "CUTERentAddressMapViewController.h"

@implementation CUTERectTypeListForm

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"single", FXFormFieldTitle:STR(@"单间"), FXFormFieldHeader:STR(@"房产类型"), FXFormFieldCell: [CUTEFormRentTypeCell class], FXFormFieldViewController: [CUTERentAddressMapViewController class]},
             @{FXFormFieldKey: @"whole", FXFormFieldTitle:STR(@"整租"), FXFormFieldCell: [CUTEFormRentTypeCell class], FXFormFieldViewController: [CUTERentAddressMapViewController class]},
             ];
}

@end
