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
#import "CUTEFormButtonCell.h"
#import "CUTEFormFixNonBreakingSpaceTextFieldCell.h"

@implementation CUTEPropertyMoreInfoForm

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"ticketTitle", FXFormFieldTitle:STR(@"标题"), FXFormFieldHeader:STR(@"其他"), FXFormFieldDefaultValue:_ticketTitle? :@"", FXFormFieldCell: [CUTEFormFixNonBreakingSpaceTextFieldCell class]},
             @{FXFormFieldKey: @"ticketDescription", FXFormFieldTitle:STR(@"详细描述"),FXFormFieldType:FXFormFieldTypeLongText, FXFormFieldDefaultValue:_ticketDescription? : @""},
             @{FXFormFieldKey: @"facility", FXFormFieldTitle:STR(@"房间设施"), FXFormFieldAction:@"editFacilities"},
//                @{FXFormFieldKey: @"feature", FXFormFieldTitle:STR(@"街区亮点")},
             @{FXFormFieldKey: @"delete", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:STR(@"删除草稿"), FXFormFieldHeader: @"", FXFormFieldAction: @"delete"},
             ];
}

@end
