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
#import "CUTETicketEditingListener.h"

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
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.price = [CUTECurrency currencyWithValue:self.form.rentPrice unit:self.form.currency];
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)onContainBillSwitch:(id)sender {
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.billCovered = self.form.containBill;
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)onRentPeriodSwitch:(id)sender {
    [self.formController updateSections];
    [self.tableView reloadData];
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    if (self.form.needSetPeriod) {
        self.ticket.rentAvailableTime = [[self.form rentAvailableTime] timeIntervalSince1970];
        self.ticket.rentDeadlineTime = [[self.form rentDeadlineTime] timeIntervalSince1970];
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
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.rentAvailableTime = [[self.form rentAvailableTime] timeIntervalSince1970];
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)onRentDeadlineTimeEdit:(id)sender {
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.rentDeadlineTime = [[self.form rentDeadlineTime] timeIntervalSince1970];
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)onMinimumRentPeriodEdit:(id)sender {
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.minimumRentPeriod = [self.form minimumRentPeriod];
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)optionBack {
    [self.navigationController popViewControllerAnimated:YES];
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.depositType = self.form.depositType;
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)syncWithUserInfo:(NSDictionary *)userInfo {

    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:@{@"ticket": self.ticket}];
    if (self.updatePriceCompletion) {
        self.updatePriceCompletion();
    }
}

- (CUTERentPriceForm *)form {
    return (CUTERentPriceForm *)self.formController.form;
}


@end
