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
#import "CUTENavigationUtil.h"
#import "NSURL+Assets.h"
#import "CUTEImageUploader.h"
#import "CUTERentAreaViewController.h"


@implementation CUTERentPropertyMoreInfoViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"更多详情");

    self.navigationItem.leftBarButtonItem = [CUTENavigationUtil backBarButtonItemWithTarget:self action:@selector(onLeftButtonPressed:)];
    self.tableView.accessibilityLabel = STR(@"更多房产信息表单");
    self.tableView.accessibilityIdentifier = self.tableView.accessibilityLabel;
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];

    if (!self.form.ticket.title) {
        [self.form syncTicketWithUpdateInfo:@{@"title": self.form.ticket.titleForDisplay}];
    }

}

- (CUTEPropertyMoreInfoForm *)form {
    return (CUTEPropertyMoreInfoForm *)self.formController.form;
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
    else if ([field.key isEqualToString:@"area"]) {
        if (self.form.ticket.rentType) {
            if ([self.form.ticket.rentType.slug hasSuffix:@":whole"]) {
                cell.textLabel.text = STR(@"房屋面积");
            }
            else {
                cell.textLabel.text = STR(@"房间面积");
            }
        }

        if (self.form.ticket.space) {
            cell.detailTextLabel.text = [NSString stringWithFormat:@"%.2f %@", self.form.ticket.space.value, self.form.ticket.space.unitSymbol];
        }
    }

}

- (void)editArea {

    CUTERentAreaViewController *controller = [CUTERentAreaViewController new];
    CUTEAreaForm *form = [CUTEAreaForm new];
    form.ticket = self.form.ticket;
    form.area = self.form.ticket.space.value;
    controller.formController.form = form;

    __weak typeof(self)weakSelf = self;
    controller.updateRentAreaCompletion = ^ {
        [weakSelf.formController enumerateFieldsWithBlock:^(FXFormField *field, NSIndexPath *indexPath) {
            if ([field.key isEqualToString:@"area"]) {
                [[weakSelf tableView] reloadRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationNone];
            }
        }];
    };

    //in case of push twice time
    if (![self.navigationController.topViewController isKindOfClass:[CUTERentAreaViewController class]]) {
        [self.navigationController pushViewController:controller animated:YES];
    }
}

- (void)editFacilities {

    NSArray *requiredEnums = @[@"indoor_facility", @"community_facility"];
    [[BFTask taskForCompletionOfAllTasksWithResults:[requiredEnums map:^id(id object) {
        return [[CUTEEnumManager sharedInstance] getEnumsByType:object];
    }]] continueWithSuccessBlock:^id(BFTask *task) {
        if (!IsArrayNilOrEmpty(task.result) && [task.result count] == [requiredEnums count]) {
            CUTETicket *ticket = self.form.ticket;
            CUTEProperty *property = [ticket property];
            CUTERentPropertyFacilityViewController *controller = [[CUTERentPropertyFacilityViewController alloc] init];
            CUTEPropertyFacilityForm *form = [CUTEPropertyFacilityForm new];
            form.ticket = self.form.ticket;
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
            [[[CUTERentTicketPublisher sharedInstance] deleteTicket:self.form.ticket] continueWithBlock:^id(BFTask *task) {
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
                    NSArray *images = [self.form.ticket.property realityImages];
                    [images each:^(NSString *object) {
                        if ([[NSURL URLWithString:object] isAssetURL]) {
                            [[CUTEImageUploader sharedInstance] cancelTaskForAssetURLString:object];
                        }
                    }];

                    [[CUTEDataManager sharedInstance] markRentTicketDeleted:self.form.ticket];
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

    [self.form syncTicketWithUpdateInfo:@{@"title": self.form.ticketTitle}];
}

- (void)onTicketDescriptionEdit:(id)sender {
    CUTEFormTextViewCell *cell = (CUTEFormTextViewCell *)sender;
    NSString *string = cell.textView.text;
    if ([self checkDescriptionContainPhoneNumber:string]) {
        [self showDescriptionContainPhoneNumberWarningAlert];
        return;
    }

    [self.form syncTicketWithUpdateInfo:@{@"ticketDescription": self.form.ticketDescription}];
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
    [UIAlertView showWithTitle:STR(@"标题字符长度限制为8到30")  message:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil tapBlock:nil];
}


@end
