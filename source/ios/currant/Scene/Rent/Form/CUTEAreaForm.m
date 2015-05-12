//
//  CUTEAreaForm.m
//  currant
//
//  Created by Foster Yin on 4/10/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEAreaForm.h"
#import "CUTECommonMacro.h"
#import "CUTEFormTextFieldCell.h"
#import "CUTEFormDefaultCell.h"

@implementation CUTEAreaForm

- (NSArray *)fields {
    NSMutableArray *array = [NSMutableArray arrayWithArray:
                             @[
                               @{FXFormFieldKey: @"unitPresentation", FXFormFieldTitle:STR(@"单位"), FXFormFieldOptions: @[STR(@"平方米"), STR(@"平方英尺")], FXFormFieldDefaultValue: STR(@"平方米"), FXFormFieldAction: @"optionBack"},
                               @{FXFormFieldKey: @"area", FXFormFieldTitle:STR(@"面积"), FXFormFieldType:FXFormFieldTypeFloat, FXFormFieldDefaultValue:@(_area), @"textField.keyboardType": @(UIKeyboardTypeDecimalPad),FXFormFieldAction: @"onAreaEdit:", FXFormFieldCell: [CUTEFormTextFieldCell class]}
                               ]];
    return array;
}

- (NSString *)unit {
    return @{STR(@"平方米"): @"meter ** 2",
             STR(@"平方英尺"): @"foot ** 2"
             }[self.unitPresentation];
}


- (NSError *)validateFormWithScenario:(NSString *)scenario {
    NSError *error = nil;
    [NGRValidator validateModel:self error:&error delegate:nil rules:^NSArray *{
        return @[NGRValidate(@"area").required().min(FLT_EPSILON),
                 ];
    }];
    return error;
}

@end
