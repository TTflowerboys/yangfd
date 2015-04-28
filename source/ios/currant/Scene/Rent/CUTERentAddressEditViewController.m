//
//  CUTERentAddressEditViewController.m
//  currant
//
//  Created by Foster Yin on 4/4/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentAddressEditViewController.h"
#import "CUTECommonMacro.h"
#import "CUTERentAddressEditForm.h"
#import "CUTEDataManager.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "FXFormViewController+CUTEForm.h"
#import "CUTEDataManager.h"
#import "CUTERentTickePublisher.h"

@interface CUTERentAddressEditViewController () {
    CUTEEnum *_lastCountry;
}

@end


@implementation CUTERentAddressEditViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"保存") style:UIBarButtonItemStylePlain target:self action:@selector(onSaveButtonPressed:)];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    [self checkNeedUpdateCityOptions];
}

- (void)checkNeedUpdateCityOptions {
    CUTEEnum *country = [[self.formController fieldForKey:@"country"] value];
    if (![_lastCountry isEqual:country]) {
        [(CUTERentAddressEditForm *)self.formController.form setCity:nil];
        [self.formController updateFormSections];
        [self.tableView reloadData];
    }
    _lastCountry = country;
}

- (void)optionBack {
    [self.navigationController popViewControllerAnimated:YES];
}

- (void)onSaveButtonPressed:(id)sender {
    if (![self validateFormWithScenario:@"edit"]) {
        return;
    }
    
    [self.navigationController popViewControllerAnimated:YES];
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)[self.formController form];
    CUTETicket *ticket = self.ticket;
    CUTEProperty *property = [ticket property];
    property.street = [CUTEI18n i18nWithValue:form.street];
    property.city = form.city;
    property.zipcode = form.postcode;
    property.country = form.country;

    //check is a draft ticket not a unfinished one
    if (!IsNilNullOrEmpty(self.ticket.identifier)) {
        [[CUTEDataManager sharedInstance] saveRentTicketToUnfinised:self.ticket];
        [[CUTERentTickePublisher sharedInstance] editTicket:self.ticket];
    }
}

@end
