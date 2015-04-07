//
//  CUTEPropertyMoreInfoForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPropertyMoreInfoForm.h"
#import "CUTECommonMacro.h"

@implementation CUTEPropertyMoreInfoForm

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"propertyTitle", FXFormFieldTitle:STR(@"标题"), FXFormFieldHeader:STR(@"其他")},
                @{FXFormFieldKey: @"propertyDescription", FXFormFieldTitle:STR(@"详细描述")},
                @{FXFormFieldKey: @"facility", FXFormFieldTitle:STR(@"房间设施")},
//                @{FXFormFieldKey: @"feature", FXFormFieldTitle:STR(@"街区亮点")},
             ];
}

@end
