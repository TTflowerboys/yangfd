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
#import "CUTETicketEditingListener.h"
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
    
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.price = [CUTECurrency currencyWithValue:self.form.rentPrice unit:self.form.currency];
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)onRentPriceEdit:(id)sender {
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.price = [CUTECurrency currencyWithValue:self.form.rentPrice unit:self.form.currency];
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)onBillCoveredSwitch:(id)sender {
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.billCovered = @(self.form.billCovered);
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)onRentPeriodSwitch:(id)sender {
    [self.formController updateSections];
    [self.tableView reloadData];
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    if (self.form.needSetPeriod) {
        self.ticket.rentAvailableTime = @([[self.form rentAvailableTime] timeIntervalSince1970]);
        self.ticket.rentDeadlineTime = @([[self.form rentDeadlineTime] timeIntervalSince1970]);
        self.ticket.minimumRentPeriod = [self.form minimumRentPeriod];
    }
    else {
        self.ticket.rentAvailableTime = 0;
        self.ticket.rentDeadlineTime = 0;
        self.ticket.minimumRentPeriod = nil;
    }
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)onRentAvailableTimeEdit:(id)sender {
    if ([self.form.rentDeadlineTime isEarlierThanDate:self.form.rentAvailableTime]) {
        [SVProgressHUD showErrorWithStatus:STR(@"结束日期不应早于开始日期")];
        return;
    }

    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.rentAvailableTime = @([[self.form rentAvailableTime] timeIntervalSince1970]);
    self.ticket.rentDeadlineTime = @([[self.form rentDeadlineTime] timeIntervalSince1970]);
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)onRentDeadlineTimeEdit:(id)sender {
    if ([self.form.rentDeadlineTime isEarlierThanDate:self.form.rentAvailableTime]) {
        [SVProgressHUD showErrorWithStatus:STR(@"结束日期不应早于开始日期")];
        return;
    }

    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.rentAvailableTime = @([[self.form rentAvailableTime] timeIntervalSince1970]);
    self.ticket.rentDeadlineTime = @([[self.form rentDeadlineTime] timeIntervalSince1970]);
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)onMinimumRentPeriodEdit:(id)sender {
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.minimumRentPeriod = [self.form minimumRentPeriod];
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)onDepositTypeEdit:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.depositType = self.form.depositType;
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)syncWithUserInfo:(NSDictionary *)userInfo {

    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:userInfo];
    if (self.updatePriceCompletion) {
        self.updatePriceCompletion();
    }
}

- (CUTERentPriceForm *)form {
    return (CUTERentPriceForm *)self.formController.form;
}


@end
