//
//  CUTEPropertyMoreInfoViewController.m
//  currant
//
//  Created by Foster Yin on 4/13/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPropertyMoreInfoViewController.h"
#import "CUTERentPropertyFacilityViewController.h"
#import "CUTEPropertyFacilityForm.h"
#import "CUTEEnumManager.h"
#import <NSArray+ObjectiveSugar.h>
#import "CUTECommonMacro.h"
#import "CUTEDataManager.h"
#import "CUTEPropertyMoreInfoForm.h"
#import "CUTEDataManager.h"
#import "CUTERentTickePublisher.h"
#import <UIAlertView+Blocks.h>
#import "CUTENotificationKey.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEFormLimitCharacterCountTextFieldCell.h"

@implementation CUTERentPropertyMoreInfoViewController

- (void)viewDidLoad {
    [super viewDidLoad];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    [self checkNeedUpdateTicketTitle];
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    FXFormField *field = [self.formController fieldForIndexPath:indexPath];
    if ([field.key isEqualToString:@"ticketTitle"]) {
        CUTEFormLimitCharacterCountTextFieldCell *titleCell = (CUTEFormLimitCharacterCountTextFieldCell *)cell;
        titleCell.limitCount = kTicketTitleMaxCharacterCount;
    }
}

- (void)editFacilities {

    NSArray *requiredEnums = @[@"indoor_facility", @"community_facility"];
    [[BFTask taskForCompletionOfAllTasksWithResults:[requiredEnums map:^id(id object) {
        return [[CUTEEnumManager sharedInstance] getEnumsByType:object];
    }]] continueWithSuccessBlock:^id(BFTask *task) {
        if (!IsArrayNilOrEmpty(task.result) && [task.result count] == [requiredEnums count]) {
            CUTETicket *ticket = self.ticket;
            CUTEProperty *property = [ticket property];
            CUTERentPropertyFacilityViewController *controller = [[CUTERentPropertyFacilityViewController alloc] init];
            controller.ticket = self.ticket;
            CUTEPropertyFacilityForm *form = [CUTEPropertyFacilityForm new];
            [form setAllIndoorFacilities:task.result[0]];
            [form setSelectedIndoorFacilities:property.indoorFacilities];
            [form setAllCommunityFacilities:task.result[1]];
            [form setSelectedCommunityFacilities:property.communityFacilities];
            controller.formController.form = form;
            [self.navigationController pushViewController:controller animated:YES];
            return nil;
        }

        return nil;
    }];
}

- (void)delete {
    UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:STR(@"删除草稿") message:nil delegate:nil cancelButtonTitle:STR(@"确定") otherButtonTitles:STR(@"取消"), nil];
    alertView.cancelButtonIndex = 1;
    alertView.tapBlock = ^(UIAlertView *alertView, NSInteger buttonIndex)  {
        if (buttonIndex != alertView.cancelButtonIndex) {
            [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_DELETE object:nil userInfo:@{@"ticket": self.ticket}];
            [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_LIST_RELOAD object:nil];

            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                [self.navigationController popToRootViewControllerAnimated:YES];
            });
        }
    };
    [alertView show];

}

- (void)onTicketTitleEdit:(id)sender {
//    CUTEPropertyMoreInfoForm *form = (CUTEPropertyMoreInfoForm *)[self.formController form];
//    if (form.ticketTitle && form.ticketTitle.length > 30) {
//        [SVProgressHUD showErrorWithStatus:STR(@"标题最长为30个字符")];
//        return;
//    }
    [self updateTicket];
}

- (void)onTicketDescriptionEdit:(id)sender {
    [self updateTicket];
}

- (void)checkNeedUpdateTicketTitle {
    if (!self.ticket.title) {
        self.ticket.title = self.ticket.titleForDisplay;
        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:@{@"ticket": self.ticket}];
    }
}

- (void)updateTicket {
    CUTEPropertyMoreInfoForm *form = (CUTEPropertyMoreInfoForm *)[self.formController form];
    CUTETicket *ticket = self.ticket;
    ticket.title = form.ticketTitle;
    ticket.ticketDescription = form.ticketDescription;
    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:@{@"ticket": self.ticket}];

}

@end
