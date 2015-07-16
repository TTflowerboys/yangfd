//
//  CUTERentPriceViewController.m
//  currant
//
//  Created by Foster Yin on 4/10/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPriceViewController.h"
#import "CUTECommonMacro.h"
#import "CUTERentPriceForm.h"
#import "CUTEDataManager.h"
#import "CUTEFormRentPriceTextFieldCell.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTERentTicketPublisher.h"
#import "CUTENotificationKey.h"
#import "NSDate-Utilities.h"

@implementation CUTERentPriceViewController

- (instancetype)init
{
    self = [super init];
    if (self) {
    }
    return self;
}


- (void)viewDidLoad {
    [super viewDidLoad];

    self.navigationItem.title = STR(@"租金");
    self.tableView.accessibilityIdentifier = STR(@"租金表单");
    self.tableView.accessibilityLabel = self.tableView.accessibilityIdentifier;
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    if (self.updatePriceCompletion) {
        self.updatePriceCompletion();
    }
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    FXFormField *field = [self.formController fieldForIndexPath:indexPath];
    CUTERentPriceForm *form = (CUTERentPriceForm *)[[self formController] form];
    if ([field.key isEqualToString:@"rentPrice"]) {
        CUTEFormRentPriceTextFieldCell *textFieldCell = (CUTEFormRentPriceTextFieldCell *)cell;
        [textFieldCell setCurrencySymbol:form.currencySymbol];
    }
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    CUTERentPriceForm *form = (CUTERentPriceForm *)[[self formController] form];
    FXFormField *field = [self.formController fieldForIndexPath:indexPath];
    if ([field.key isEqualToString:@"rentAvailableTime"]) {
        FXFormDatePickerCell *cell = (FXFormDatePickerCell *)[tableView cellForRowAtIndexPath:indexPath];
        if (!form.rentAvailableTime || fequalzero([[form rentAvailableTime] timeIntervalSince1970])) {
            form.rentAvailableTime = [NSDate date];
            cell.datePicker.date = [NSDate date];
            cell.datePicker.minimumDate = [NSDate date];
            [cell update];
        }
    }
    else if ([field.key isEqualToString:@"rentDeadlineTime"]) {
        FXFormDatePickerCell *cell = (FXFormDatePickerCell *)[tableView cellForRowAtIndexPath:indexPath];
        if (!form.rentDeadlineTime || fequalzero([[form rentDeadlineTime] timeIntervalSince1970])) {
            form.rentDeadlineTime = [NSDate date];
            cell.datePicker.date = [NSDate date];
            cell.datePicker.minimumDate = [NSDate date];
            [cell update];
        }
    }
}

- (void)onCurrencyEdit:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
    [self.form syncTicketWithUpdateInfo:@{@"price":[CUTECurrency currencyWithValue:self.form.rentPrice unit:self.form.currency]}];
}

- (void)onRentPriceEdit:(id)sender {
    [self.form syncTicketWithUpdateInfo:@{@"price":[CUTECurrency currencyWithValue:self.form.rentPrice unit:self.form.currency]}];
}

- (void)onBillCoveredSwitch:(id)sender {
    [self.form syncTicketWithUpdateInfo:@{@"billCovered": @(self.form.billCovered)}];
}

- (void)onRentPeriodSwitch:(id)sender {
    [self.formController updateSections];
    [self.tableView reloadData];

    if (self.form.needSetPeriod) {

        [self.form syncTicketWithUpdateInfo:@{@"rentAvailableTime": @([[self.form rentAvailableTime] timeIntervalSince1970]),
                                              @"rentDeadlineTime": @([[self.form rentDeadlineTime] timeIntervalSince1970]),
                                              @"minimumRentPeriod": [self.form minimumRentPeriod]
                                              }];
    }
    else {
        [self.form syncTicketWithUpdateInfo:@{@"rentAvailableTime": [NSNull null],
                                              @"rentDeadlineTime": [NSNull null],
                                              @"minimumRentPeriod": [NSNull null]
                                              }];
        
    }

}

- (void)onRentAvailableTimeEdit:(id)sender {
    if ([self.form.rentDeadlineTime isEarlierThanDate:self.form.rentAvailableTime]) {
        [SVProgressHUD showErrorWithStatus:STR(@"结束日期不应早于开始日期")];
        return;
    }

    [self.form syncTicketWithUpdateInfo:@{@"rentAvailableTime": @([[self.form rentAvailableTime] timeIntervalSince1970]),
                                          @"rentDeadlineTime": @([[self.form rentDeadlineTime] timeIntervalSince1970]),
                                          }];

}

- (void)onRentDeadlineTimeEdit:(id)sender {
    if ([self.form.rentDeadlineTime isEarlierThanDate:self.form.rentAvailableTime]) {
        [SVProgressHUD showErrorWithStatus:STR(@"结束日期不应早于开始日期")];
        return;
    }

    [self.form syncTicketWithUpdateInfo:@{@"rentAvailableTime": @([[self.form rentAvailableTime] timeIntervalSince1970]),
                                          @"rentDeadlineTime": @([[self.form rentDeadlineTime] timeIntervalSince1970]),
                                          }];
}

- (void)onMinimumRentPeriodEdit:(id)sender {
    [self.form syncTicketWithUpdateInfo:@{@"minimumRentPeriod": [self.form minimumRentPeriod],
                                          }];
}

- (void)onDepositTypeEdit:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
    [self.form syncTicketWithUpdateInfo:@{@"depositType": [self.form depositType],
                                          }];
}

- (CUTERentPriceForm *)form {
    return (CUTERentPriceForm *)self.formController.form;
}


@end
