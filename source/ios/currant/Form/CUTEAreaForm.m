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
                               @{FXFormFieldKey: @"unitPresentation", FXFormFieldTitle:STR(@"单位"), FXFormFieldOptions: @[STR(@"平方米"), STR(@"平方英尺")], FXFormFieldDefaultValue: STR(@"平方米")},
                               @{FXFormFieldKey: @"area", FXFormFieldTitle:STR(@"面积"), FXFormFieldType:FXFormFieldTypeFloat}
                               ]];
    return array;
}

- (NSString *)unit {
    return @{STR(@"平方米"): @"meter ** 2",
             STR(@"平方英尺"): @"foot ** 2"
             }[self.unitPresentation];
}

@end
