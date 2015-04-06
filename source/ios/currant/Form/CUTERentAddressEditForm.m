//
//  CUTERentAddressEditForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentAddressEditForm.h"
#import "CUTECommonMacro.h"

@implementation CUTERentAddressEditForm

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"street", FXFormFieldTitle: STR(@"街道"), FXFormFieldHeader:STR(@"位置")},
             @{FXFormFieldKey: @"city", FXFormFieldTitle: STR(@"城市")},
             @{FXFormFieldKey: @"postCode", FXFormFieldTitle: STR(@"邮政编码")},
             @{FXFormFieldKey: @"country", FXFormFieldTitle: STR(@"国家"), FXFormFieldOptions: @[STR(@"英国"), STR(@"中国")], FXFormFieldDefaultValue: STR(@"英国"),}
             ];
}
@end
