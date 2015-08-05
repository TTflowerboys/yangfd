//
//  CUTERentPeriodViewController.m
//  currant
//
//  Created by Foster Yin on 7/29/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPeriodViewController.h"
#import "CUTERentPeriodForm.h"
#import "NSDate-Utilities.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTECommonMacro.h"

@interface CUTERentPeriodViewController ()

@end

@implementation CUTERentPeriodViewController

- (CUTERentPeriodForm *)form {
    return (CUTERentPeriodForm *)self.formController.form;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    self.navigationItem.title = STR(@"租期");
    self.tableView.accessibilityIdentifier = STR(@"租期表单");
    self.tableView.accessibilityLabel = self.tableView.accessibilityIdentifier;
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    if (self.updatePeriodCompletion) {
        self.updatePeriodCompletion();
    }
}


- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    CUTERentPeriodForm *form = (CUTERentPeriodForm *)[[self formController] form];
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


- (void)onRentPeriodSwitch:(id)sender {
    [self.formController updateSections];
    [self.tableView reloadData];

    CUTERentPeriodForm *form = (CUTERentPeriodForm *)self.form;

    if (self.form.needSetPeriod) {
        if (!form.rentAvailableTime) {
            form.rentAvailableTime = [NSDate date];
        }
        if (!form.minimumRentPeriod) {
            form.minimumRentPeriod = [CUTETimePeriod timePeriodWithValue:1 unit:@"day"];
        }

        [form syncTicketWithBlock:^(CUTETicket *ticket) {
            ticket.rentAvailableTime = @([[form rentAvailableTime] timeIntervalSince1970]);
            ticket.minimumRentPeriod = form.minimumRentPeriod;
            ticket.rentDeadlineTime = form.rentDeadlineTime? @([form rentDeadlineTime].timeIntervalSince1970): nil;
        }];

    }
    else {
        [form syncTicketWithBlock:^(CUTETicket *ticket) {
            ticket.rentAvailableTime = nil;
            ticket.rentDeadlineTime = nil;
            ticket.minimumRentPeriod = nil;
        }];
    }
}

- (void)onRentAvailableTimeEdit:(id)sender {
    if ([self.form.rentDeadlineTime isEarlierThanDate:self.form.rentAvailableTime]) {
        [SVProgressHUD showErrorWithStatus:STR(@"结束日期不应早于开始日期")];
        return;
    }

    [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
        ticket.rentAvailableTime = @([[self.form rentAvailableTime] timeIntervalSince1970]);
        ticket.rentDeadlineTime = self.form.rentDeadlineTime? @([self.form rentDeadlineTime].timeIntervalSince1970): nil;
    }];
}

- (void)onRentDeadlineTimeEdit:(id)sender {
    if ([self.form.rentDeadlineTime isEarlierThanDate:self.form.rentAvailableTime]) {
        [SVProgressHUD showErrorWithStatus:STR(@"结束日期不应早于开始日期")];
        return;
    }

    [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
        ticket.rentAvailableTime = @([[self.form rentAvailableTime] timeIntervalSince1970]);
        ticket.rentDeadlineTime = self.form.rentDeadlineTime? @([self.form rentDeadlineTime].timeIntervalSince1970): nil;
    }];
}

- (void)onMinimumRentPeriodEdit:(id)sender {
    [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
        ticket.minimumRentPeriod = self.form.minimumRentPeriod;
    }];
}


@end
