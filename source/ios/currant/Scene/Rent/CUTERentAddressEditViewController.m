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
    if (_lastCountry && ![_lastCountry isEqual:country]) {
        [(CUTERentAddressEditForm *)self.formController.form setCity:nil];
        [self.formController updateFormSections];
        [self.tableView reloadData];
    }
    _lastCountry = country;
}



- (void)onSaveButtonPressed:(id)sender {

    [self.navigationController popViewControllerAnimated:YES];
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)[self.formController form];
    CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
    CUTEProperty *property = [ticket property];
    property.street = [CUTEI18n i18nWithValue:form.street];
    property.city = form.city;
    property.zipcode = form.zipcode;
    property.country = form.country;
}

@end
