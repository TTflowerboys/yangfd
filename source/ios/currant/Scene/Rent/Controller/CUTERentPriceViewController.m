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
#import "CUTEFormCurrencyTextFieldCell.h"

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

    self.navigationItem.title = STR(@"RentPrice/租金");
    self.tableView.accessibilityIdentifier = STR(@"RentPrice/租金表单");
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
    else if ([field.key isEqualToString:@"deposit"]) {
        CUTEFormCurrencyTextFieldCell *textFieldCell = (CUTEFormCurrencyTextFieldCell *)cell;
        [textFieldCell setCurrencySymbol:form.currencySymbol];
    }
}


- (void)onCurrencyEdit:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
    [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
        ticket.price = [CUTECurrency currencyWithValue:self.form.rentPrice unit:self.form.currency];
    }];
}

- (void)onRentPriceEdit:(id)sender {
    [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
        ticket.price = [CUTECurrency currencyWithValue:self.form.rentPrice unit:self.form.currency];
    }];
}

- (void)onBillCoveredSwitch:(id)sender {
    [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
        ticket.billCovered = @(self.form.billCovered);
    }];
}


- (void)onDepositEdit:(id)sender {
    [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
        ticket.deposit = [CUTECurrency currencyWithValue:self.form.deposit unit:self.form.currency];
    }];
}

- (CUTERentPriceForm *)form {
    return (CUTERentPriceForm *)self.formController.form;
}


@end
