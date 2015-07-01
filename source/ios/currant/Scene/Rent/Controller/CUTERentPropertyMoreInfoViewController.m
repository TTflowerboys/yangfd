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
#import "CUTERentTicketPublisher.h"
#import <UIAlertView+Blocks.h>
#import "CUTENotificationKey.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEFormLimitCharacterCountTextFieldCell.h"
#import "CUTEFormTextViewCell.h"
#import "CUTETicketEditingListener.h"
#import "CUTENavigationUtil.h"


@implementation CUTERentPropertyMoreInfoViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    self.navigationItem.leftBarButtonItem = [CUTENavigationUtil backBarButtonItemWithTarget:self action:@selector(onLeftButtonPressed:)];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    [self checkNeedUpdateTicketTitle];
}

- (CUTEFormTextFieldCell *)getTicketTitleCell {
    FXFormField *field = [self.formController fieldForKey:@"ticketTitle"];
    NSIndexPath *indexPath = [self.formController indexPathForField:field];
    CUTEFormTextFieldCell *cell = (CUTEFormTextFieldCell *)[self.tableView cellForRowAtIndexPath:indexPath];
    return cell;
}

- (CUTEFormTextViewCell *)getTicketDescriptionCell {
    FXFormField *field = [self.formController fieldForKey:@"ticketDescription"];
    NSIndexPath *indexPath = [self.formController indexPathForField:field];
    CUTEFormTextViewCell *cell = (CUTEFormTextViewCell *)[self.tableView cellForRowAtIndexPath:indexPath];
    return cell;
}

- (void)onLeftButtonPressed:(id)sender {

    NSString *ticketTitle = [self getTicketTitleCell].textField.text;
    NSString *ticketDescription = [self getTicketDescriptionCell].textView.text;

    if ([self checkTitleLengthInvalid:ticketTitle]) {
        [self showTitleLengthWarningAlert];
        return;
    }
    if ([self checkDescriptionContainPhoneNumber:ticketDescription]) {
        [self showDescriptionContainPhoneNumberWarningAlert];
        return;
    }

    [self.navigationController popViewControllerAnimated:YES];
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
    UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:STR(@"删除") message:nil delegate:nil cancelButtonTitle:STR(@"确定") otherButtonTitles:STR(@"取消"), nil];
    alertView.cancelButtonIndex = 1;
    alertView.tapBlock = ^(UIAlertView *alertView, NSInteger buttonIndex)  {
        if (buttonIndex != alertView.cancelButtonIndex) {

            [SVProgressHUD show];
            [[[CUTERentTicketPublisher sharedInstance] deleteTicket:self.ticket] continueWithBlock:^id(BFTask *task) {
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
                    [[CUTEDataManager sharedInstance] markRentTicketDeleted:self.ticket];
                    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_LIST_RELOAD object:self];
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

    CUTEFormTextFieldCell *cell = (CUTEFormTextFieldCell *)sender;
    NSString *string = cell.textField.text;
    if ([self checkTitleLengthInvalid:string]) {
        [self showTitleLengthWarningAlert];
        return;
    }

    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.title = self.form.ticketTitle;
    [ticketListener stopListenMark];
    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:ticketListener.getSyncUserInfo];

}

- (void)onTicketDescriptionEdit:(id)sender {
    CUTEFormTextViewCell *cell = (CUTEFormTextViewCell *)sender;
    NSString *string = cell.textView.text;
    if ([self checkDescriptionContainPhoneNumber:string]) {
        [self showDescriptionContainPhoneNumberWarningAlert];
        return;
    }

    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.ticketDescription = self.form.ticketDescription;
    [ticketListener stopListenMark];
    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:ticketListener.getSyncUserInfo];
}

- (BOOL)checkDescriptionContainPhoneNumber:(NSString *)string {
    if (!IsNilNullOrEmpty(string)) {
        NSError *error;
        NSDataDetector *detector = [[NSDataDetector alloc] initWithTypes:NSTextCheckingTypePhoneNumber error:&error];
        NSTextCheckingResult *result = [detector firstMatchInString:string options:0 range:NSMakeRange(0, string.length)];
        if (result && result.range.location != NSNotFound) {
            return YES;
        }
    }

    return NO;
}

- (BOOL)checkTitleLengthInvalid:(NSString *)string {
    return string.length < 8 || string.length > 30;
}

- (void)showDescriptionContainPhoneNumberWarningAlert {
    [UIAlertView showWithTitle:STR(@"平台将提供房东联系方式选择，请删除在此填写任何形式的联系方式，违规发布将会予以处理")  message:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil tapBlock:nil];
}

- (void)showTitleLengthWarningAlert {
    [UIAlertView showWithTitle:STR(@"字符长度限制为8-30")  message:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil tapBlock:nil];
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
