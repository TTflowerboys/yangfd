//
//  CUTEAreaForm.m
//  currant
//
//  Created by Foster Yin on 4/10/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEAreaForm.h"
#import "CUTECommonMacro.h"

@implementation CUTEAreaForm

- (NSArray *)fields {
    NSMutableArray *array = [NSMutableArray arrayWithArray:
                             @[
                               @{FXFormFieldKey: @"unit", FXFormFieldTitle:STR(@"单位"), FXFormFieldOptions: @[@"meter ** 2", @"foot ** 2"], FXFormFieldDefaultValue: @"meter ** 2"},
                               @{FXFormFieldKey: @"area", FXFormFieldTitle:STR(@"面积")}
                               ]];
    return array;
}

@end
