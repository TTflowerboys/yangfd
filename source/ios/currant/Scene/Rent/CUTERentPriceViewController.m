//
//  CUTERentPriceViewController.m
//  currant
//
//  Created by Foster Yin on 4/10/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPriceViewController.h"
#import "CUTECommonMacro.h"

@implementation CUTERentPriceViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"保存") style:UIBarButtonItemStylePlain target:self action:@selector(onSaveButtonPressed:)];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];

}

- (void)setRentPeriod {
    [self.formController updateFormSections];
    [self.tableView reloadData];
}

- (void)onSaveButtonPressed:(id)sender {

    [self.navigationController popViewControllerAnimated:YES];
    
}

@end
