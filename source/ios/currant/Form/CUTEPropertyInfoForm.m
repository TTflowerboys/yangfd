//
//  CUTEPropertyInfoForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPropertyInfoForm.h"

@implementation CUTEPropertyInfoForm

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"photo", FXFormFieldHeader: STR(@"房间照片")},
                @{FXFormFieldKey: @"propertyType", FXFormFieldHeader: STR(@"基本信息")},
                @{FXFormFieldKey: @"bedroom", FXFormFieldCell: [FXFormStepperCell class]},
              @"area",
              @"rentPrice",
                @{FXFormFieldKey: @"moreInfo", FXFormFieldTitle: STR(@"添加房屋设施及描述")},
             ];
}

@end
