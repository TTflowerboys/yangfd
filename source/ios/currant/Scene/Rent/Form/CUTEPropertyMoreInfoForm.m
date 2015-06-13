//
//  CUTEPropertyMoreInfoForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPropertyMoreInfoForm.h"
#import "CUTECommonMacro.h"
#import "CUTERentPropertyFacilityViewController.h"
#import "CUTEFormButtonCell.h"
#import "CUTEFormFixNonBreakingSpaceTextFieldCell.h"
#import "CUTEFormLimitCharacterCountTextFieldCell.h"
#import "CUTEFormTextViewCell.h"
#import "CUTEFormDefaultCell.h"

@implementation CUTEPropertyMoreInfoForm

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"ticketTitle", FXFormFieldTitle:STR(@"标题"), FXFormFieldHeader:STR(@"其他"), FXFormFieldDefaultValue:_ticketTitle? :@"", FXFormFieldCell: [CUTEFormLimitCharacterCountTextFieldCell class], FXFormFieldAction:@"onTicketTitleEdit:"},
             @{FXFormFieldKey: @"ticketDescription", FXFormFieldTitle:STR(@"详细描述"),FXFormFieldType:FXFormFieldTypeLongText, FXFormFieldDefaultValue:_ticketDescription? : @"", FXFormFieldAction:@"onTicketDescriptionEdit:", FXFormFieldCell: [CUTEFormTextViewCell class], FXFormFieldPlaceholder: STR(@"补充您对租客的要求和对房屋特点的描述。平台将提供房东联系方式选择，请勿在此填写任何形式的联系方式，违规发布将会予以处理。")},
             @{FXFormFieldKey: @"facility", FXFormFieldTitle:STR(@"配套设施"), FXFormFieldAction:@"editFacilities"},
//                @{FXFormFieldKey: @"feature", FXFormFieldTitle:STR(@"街区亮点")},
             @{FXFormFieldKey: @"delete", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:STR(@"删除草稿"), FXFormFieldHeader: @"", FXFormFieldAction: @"delete"},
             ];
}

@end
