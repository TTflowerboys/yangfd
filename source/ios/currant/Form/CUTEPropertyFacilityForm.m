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

- (NSArray *)cuteFields {
  return @[@{FXFormFieldKey: @"television", FXFormFieldTitle: STR(@"电视"), FXFormFieldHeader: STR(@"常用设施")},
              @{FXFormFieldKey: @"toaster", FXFormFieldTitle: STR(@"烤箱")},
              @{FXFormFieldKey: @"washingMachine",FXFormFieldTitle: STR(@"洗衣机")},
              @{FXFormFieldKey: @"firePlace", FXFormFieldTitle: STR(@"壁炉")},
              @{FXFormFieldKey: @"parkingSpace", FXFormFieldTitle: STR(@"停车位"), FXFormFieldHeader: STR(@"小区设施")},
              @{FXFormFieldKey: @"pool", FXFormFieldTitle: STR(@"游泳池")},
              @{FXFormFieldKey: @"basketballCourt", FXFormFieldTitle: STR(@"篮球场")},
           ];
}

@end
