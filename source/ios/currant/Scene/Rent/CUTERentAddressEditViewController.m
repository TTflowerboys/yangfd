//
//  CUTERentAddressEditViewController.m
//  currant
//
//  Created by Foster Yin on 4/4/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentAddressEditViewController.h"
#import "CUTECommonMacro.h"

@implementation CUTERentAddressEditViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"保存") style:UIBarButtonItemStylePlain target:self action:@selector(onSaveButtonPressed:)];
}

- (void)viewWillAppear:(BOOL)animated {

    [super viewWillAppear:animated];
    //reload city base on country
    //FXFormField *cityField = [self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:1 inSection:0]];

    //[[self.formController tableView] reloadData];
    NSArray *sections = [self.formController sections];
//    FXFormSection *section = [sections firstObject];

}

- (void)onSaveButtonPressed:(id)sender {

    [self.navigationController popViewControllerAnimated:YES];

}

@end
