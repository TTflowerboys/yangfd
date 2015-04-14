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

@implementation CUTERentPriceViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"保存") style:UIBarButtonItemStylePlain target:self action:@selector(onSaveButtonPressed:)];
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

- (void)setRentPeriod {
    [self.formController updateFormSections];
    [self.tableView reloadData];
}

- (void)onSaveButtonPressed:(id)sender {

    [self.navigationController popViewControllerAnimated:YES];
    CUTERentPriceForm *form = (CUTERentPriceForm *)[[self formController] form];
    CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
    ticket.depositType = form.depositType;
    ticket.price = [CUTECurrency currencyWithValue:form.rentPrice unit:form.currency];
    ticket.billCovered = form.containBill;
    if (form.needSetPeriod) {
        ticket.rentAvailableTime = [form startDate];
        ticket.rentPeriod = [form period];
    }
}

@end
