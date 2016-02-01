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
#import "CUTEFormCurrencyTextFieldCell.h"
#import "currant-Swift.h"

@implementation CUTEPropertyMoreInfoForm

- (NSArray *)fields {
    return @[
             @{FXFormFieldKey: @"ticketTitle", FXFormFieldTitle:STR(@"PropertyMoreInfo/标题"), FXFormFieldHeader:STR(@"PropertyMoreInfo/其他"), FXFormFieldDefaultValue:_ticketTitle? :@"", FXFormFieldCell: [CUTEFormLimitCharacterCountTextFieldCell class], FXFormFieldAction:@"onTicketTitleEdit:"},
             @{FXFormFieldKey: @"ticketDescription", FXFormFieldTitle:STR(@"PropertyMoreInfo/详细描述"),FXFormFieldType:FXFormFieldTypeLongText, FXFormFieldDefaultValue:_ticketDescription? : @"", FXFormFieldAction:@"onTicketDescriptionEdit:", FXFormFieldCell: [CUTEFormTextViewCell class], FXFormFieldPlaceholder: STR(@"PropertyMoreInfo/请补充您对房屋特点的描述，优质而独特的房源描述会得到平台的推荐，提升您的房源排名。（请勿在此填写任何形式的联系方式，违规发布将会予以处理）")},
             @{FXFormFieldKey: @"area", FXFormFieldTitle:STR(@"PropertyMoreInfo/面积"), FXFormFieldAction: @"editArea"},
             @{FXFormFieldKey: @"facility", FXFormFieldTitle:STR(@"PropertyMoreInfo/配套设施"), FXFormFieldAction:@"editFacilities"},
             @{FXFormFieldKey: @"currency", FXFormFieldTitle:STR(@"RentPrice/货币"), FXFormFieldOptions: [CUTECurrency currencyUnitArray], FXFormFieldDefaultValue: _currency ? : [CUTECurrency defaultCurrencyUnit], FXFormFieldAction: @"onCurrencyEdit:", FXFormFieldHeader: STR(@"PropertyMoreInfo/定金")},
             @{FXFormFieldKey: @"holdingDeposit", FXFormFieldTitle:STR(@"PropertyMoreInfo/定金"), FXFormFieldType:FXFormFieldTypeFloat, FXFormFieldCell: [CUTEFormCurrencyTextFieldCell class], @"textField.keyboardType": @(UIKeyboardTypeDecimalPad), FXFormFieldAction: @"onHoldingDepositEdit:", FXFormFieldValueTransformer: [CUTEPlainTextNumberTransformer class], FXFormFieldFooter: STR(@"PropertyMoreInfo/Holding Deposit，是租客确定预订后锁定房源所需要向您交付的定金，当租客入住时确保房源和确认信息一致，平台将在24小时后把钱转付给您以冲抵押金或房租")},
//                @{FXFormFieldKey: @"feature", FXFormFieldTitle:STR(@"街区亮点")},
             @{FXFormFieldKey: @"delete", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:STR(@"PropertyMoreInfo/删除"), FXFormFieldHeader: @"", FXFormFieldAction: @"delete"},
             ];
}

- (NSString *)currencySymbol {
    return [CUTECurrency symbolOfCurrencyUnit:self.currency];
}

@end
