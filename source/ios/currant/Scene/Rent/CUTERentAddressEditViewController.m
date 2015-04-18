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

- (BOOL)validateForm {
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    if (!form.city) {
        [SVProgressHUD showErrorWithStatus:STR(@"请编辑城市")];
        return NO;
    }
    if (IsNilNullOrEmpty(form.postcode)) {
        [SVProgressHUD showErrorWithStatus:STR(@"请编辑Postcode")];
        return NO;
    }
    if (!form.country) {
        [SVProgressHUD showErrorWithStatus:STR(@"请编辑国家")];
    }
    return YES;
}




- (void)onSaveButtonPressed:(id)sender {
    if (![self validateForm]) {
        return;
    }
    
    [self.navigationController popViewControllerAnimated:YES];
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)[self.formController form];
    CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
    CUTEProperty *property = [ticket property];
    property.street = [CUTEI18n i18nWithValue:form.street];
    property.city = form.city;
    property.zipcode = form.postcode;
    property.country = form.country;
}

@end
