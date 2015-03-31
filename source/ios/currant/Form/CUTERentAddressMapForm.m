//
//  CUTERentAddressMapForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentAddressMapForm.h"

@implementation CUTERentAddressMapForm

- (NSArray *)fields {
    return @[@{FXFormFieldKey: @"location"},@{FXFormFieldKey: @"edit"},@{FXFormFieldKey: @"propertyInfo"},
             ];
}

@end
