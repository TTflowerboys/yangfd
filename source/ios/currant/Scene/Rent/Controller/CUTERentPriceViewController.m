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
#import "CUTERentTickePublisher.h"
#import "CUTENotificationKey.h"

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

- (void)onRentPriceEdit:(id)sender {
    [self updateForm];
}

- (void)onContainBillSwitch:(id)sender {
    [self updateForm];
}

- (void)onRentPeriodSwitch:(id)sender {
    [self.formController updateSections];
    [self.tableView reloadData];
    [self updateForm];
}

- (void)onRentAvailableTimeEdit:(id)sender {
    [self updateForm];
}

- (void)onRentDeadlineTimeEdit:(id)sender {
    [self updateForm];
}

- (void)optionBack {
    [self.navigationController popViewControllerAnimated:YES];
    [self updateForm];
}

- (void)updateForm {
    CUTERentPriceForm *form = (CUTERentPriceForm *)[[self formController] form];
    CUTETicket *ticket = self.ticket;
    ticket.depositType = form.depositType;
    ticket.price = [CUTECurrency currencyWithValue:form.rentPrice unit:form.currency];
    ticket.billCovered = form.containBill;
    if (form.needSetPeriod) {
        ticket.rentAvailableTime = [[form rentAvailableTime] timeIntervalSince1970];
        ticket.rentDeadlineTime = [[form rentDeadlineTime] timeIntervalSince1970];
        ticket.minimumRentPeriod = [form minimumRentPeriod];
    }

    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:@{@"ticket": self.ticket}];
    if (self.updatePriceCompletion) {
        self.updatePriceCompletion();
    }
}

@end
