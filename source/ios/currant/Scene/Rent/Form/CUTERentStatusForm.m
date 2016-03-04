//
//  CUTERentStatusForm.m
//  currant
//
//  Created by Foster Yin on 3/4/16.
//  Copyright © 2016 BBTechgroup. All rights reserved.
//

#import "CUTERentStatusForm.h"
#import "CUTECommonMacro.h"
#import "CUTEFormButtonCell.h"


@implementation CUTERentStatusForm

- (NSArray *)fields {

    if ([self.ticket.status isEqualToString:kTicketStatusToRent]) {

        return @[
                 @{FXFormFieldKey: @"draft", FXFormFieldTitle:STR(@"RentStatus/下架"), FXFormFieldHeader: STR(@"RentStatus/更新状态")},
                 @{FXFormFieldKey: @"rent", FXFormFieldTitle:STR(@"RentStatus/已出租")},
                 @{FXFormFieldKey: @"delete", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:STR(@"RentStatus/删除房源"), FXFormFieldHeader: @"", FXFormFieldAction: @"delete"},
                 ];
    }
    else if ([self.ticket.status isEqualToString:kTicketStatusDraft]) {

        return @[
                 @{FXFormFieldKey: @"delete", FXFormFieldCell: [CUTEFormButtonCell class], FXFormFieldTitle:STR(@"RentStatus/删除房源"), FXFormFieldHeader: STR(@"RentStatus/您的房源当前处于草稿状态，如您不想继续发布，可以删除房源"), FXFormFieldAction: @"delete"},
                 ];
    }
    else {
        return @[];
    }
}

@end
