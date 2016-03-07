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
                 @{FXFormFieldKey: @"draft", FXFormFieldTitle:STR(@"RentStatus/草稿"), FXFormFieldHeader: STR(@"RentStatus/更新状态")},
                 @{FXFormFieldKey: @"toRent", FXFormFieldTitle:STR(@"RentStatus/发布中")},
                 @{FXFormFieldKey: @"rent", FXFormFieldTitle:STR(@"RentStatus/已租出")},
                 ];
    }
    else {
        return @[];
    }
}

@end
