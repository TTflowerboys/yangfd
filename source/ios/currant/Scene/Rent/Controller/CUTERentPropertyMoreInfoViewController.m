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
#import "CUTEFormTextViewCell.h"
#import "CUTETicketEditingListener.h"

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

            [SVProgressHUD show];
            [[[CUTERentTickePublisher sharedInstance] deleteTicket:self.ticket] continueWithBlock:^id(BFTask *task) {
                if (task.error) {
                    [SVProgressHUD showErrorWithError:task.error];
                }
                else if (task.exception) {
                    [SVProgressHUD showErrorWithException:task.exception];
                }
                else if (task.isCancelled) {
                    [SVProgressHUD showErrorWithCancellation];
                }
                else {
                    [SVProgressHUD dismiss];
                    
                    [[CUTEDataManager sharedInstance] deleteUnfinishedRentTicket:self.ticket];
                    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_LIST_RELOAD object:nil];
                    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                        [self.navigationController popToRootViewControllerAnimated:YES];
                    });
                }
                
                return task;
            }];
        }
    };
    [alertView show];

}

- (void)onTicketTitleEdit:(id)sender {
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.title = self.form.ticketTitle;
    [ticketListener stopListenMark];
    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:ticketListener.getSyncUserInfo];

}

- (void)onTicketDescriptionEdit:(id)sender {
    CUTEFormTextViewCell *cell = (CUTEFormTextViewCell *)sender;
    NSString *string = cell.textView.text;
    if (!IsNilNullOrEmpty(string)) {
        NSError *error;
        NSDataDetector *detector = [[NSDataDetector alloc] initWithTypes:NSTextCheckingTypePhoneNumber error:&error];
        NSTextCheckingResult *result = [detector firstMatchInString:string options:0 range:NSMakeRange(0, string.length)];
        if (result && result.range.location != NSNotFound) {
            [UIAlertView showWithTitle:STR(@"为避免不必要骚扰，请勿在此填写联系方式")  message:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil tapBlock:nil];
            return;
        }
    }


    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.ticketDescription = self.form.ticketDescription;
    [ticketListener stopListenMark];
    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:ticketListener.getSyncUserInfo];
}

- (CUTEPropertyMoreInfoForm *)form {
    return (CUTEPropertyMoreInfoForm *)self.formController.form;
}

- (void)checkNeedUpdateTicketTitle {
    if (!self.ticket.title) {
        CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
        self.ticket.title = self.ticket.titleForDisplay;
        [ticketListener stopListenMark];
        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:ticketListener.getSyncUserInfo];
    }
}



@end
