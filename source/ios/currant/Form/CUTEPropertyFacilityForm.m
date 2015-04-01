//
//  CUTEPropertyFacilityForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPropertyFacilityForm.h"
#import "CUTECommonMacro.h"

@implementation CUTEPropertyFacilityForm

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"television", FXFormFieldHeader: STR(@"常用设施")},
             @"toaster",
             @"washingMachine",
             @"firePlace",
             @{FXFormFieldKey: @"parkingSpace", FXFormFieldHeader: STR(@"小区设施")},
             @"pool",
             @"basketballCourt",
             ];
}

@end
