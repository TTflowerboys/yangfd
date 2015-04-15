//
//  CUTEPropertyMoreInfoForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPropertyMoreInfoForm.h"
#import "CUTECommonMacro.h"
#import "CUTEPropertyFacilityViewController.h"

@implementation CUTEPropertyMoreInfoForm

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"ticketTitle", FXFormFieldTitle:STR(@"标题"), FXFormFieldHeader:STR(@"其他")},
             @{FXFormFieldKey: @"ticketDescription", FXFormFieldTitle:STR(@"详细描述"),FXFormFieldType:FXFormFieldTypeLongText},
             @{FXFormFieldKey: @"facility", FXFormFieldTitle:STR(@"房间设施"), FXFormFieldAction:@"editFacilities"},
//                @{FXFormFieldKey: @"feature", FXFormFieldTitle:STR(@"街区亮点")},
             ];
}

@end
