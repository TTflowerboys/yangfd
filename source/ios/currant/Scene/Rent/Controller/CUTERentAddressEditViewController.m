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
#import "CUTENotificationKey.h"

@interface CUTERentAddressEditViewController () {
    CUTEEnum *_lastCountry;
}

@end


@implementation CUTERentAddressEditViewController

- (void)viewDidLoad {
    [super viewDidLoad];
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
    [self updateTicket];
}

- (void)onStreetEdit:(id)sender {
    [self updateTicket];
}

- (void)onPostcodeEdit:(id)sender {
    [self updateTicket];
}

- (void)updateTicket {
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)[self.formController form];
    CUTETicket *ticket = self.ticket;
    CUTEProperty *property = [ticket property];
    property.street = form.street;
    property.city = form.city;
    property.zipcode = form.postcode;
    property.country = form.country;

    //check is a draft ticket not a unfinished one
    if (!IsNilNullOrEmpty(self.ticket.identifier)) {
        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:@{@"ticket": self.ticket}];
    }
}

@end
