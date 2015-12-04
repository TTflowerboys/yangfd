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
             @{FXFormFieldKey: @"ticketTitle", FXFormFieldTitle:STR(@"PropertyMoreInfo/标题"), FXFormFieldHeader:STR(@"PropertyMoreInfo/其他"), FXFormFieldDefaultValue:_ticketTitle? :@"", FXFormFieldCell: [CUTEFormLimitCharacterCountTextFieldCell class], FXFormFieldAction:@"onTicketTitleEdit:"},
             @{FXFormFieldKey: @"ticketDescription", FXFormFieldTitle:STR(@"PropertyMoreInfo/详细描述"),FXFormFieldType:FXFormFieldTypeLongText, FXFormFieldDefaultValue:_ticketDescription? : @"", FXFormFieldAction:@"onTicketDescriptionEdit:", FXFormFieldCell: [CUTEFormTextViewCell class], FXFormFieldPlaceholder: STR(@"PropertyMoreInfo/请补充您对租客的要求和对房屋特点的描述，优质而独特的房源描述会得到平台的推荐，提升您的房源排名。（请勿在此填写任何形式的联系方式，违规发布将会予以处理）")},
             @{FXFormFieldKey: @"area", FXFormFieldTitle:STR(@"PropertyMoreInfo/面积"), FXFormFieldAction: @"editArea"},
             @{FXFormFieldKey: @"facility", FXFormFieldTitle:STR(@"PropertyMoreInfo/配套设施"), FXFormFieldAction:@"editFacilities"},
//                @{FXFormFieldKey: @"feature", FXFormFieldTitle:STR(@"街区亮点")},
             @{FXFormFieldKey: @"delete", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:STR(@"PropertyMoreInfo/删除"), FXFormFieldHeader: @"", FXFormFieldAction: @"delete"},
             ];
}

@end
