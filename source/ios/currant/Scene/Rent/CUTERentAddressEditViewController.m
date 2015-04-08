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

- (void)tableView:(UITableView *)tableView willDisplayCell:(FXFormBaseCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    if ([cell.field.key isEqualToString:@"street"]) {
        FXFormTextFieldCell *textFieldCell = (FXFormTextFieldCell *)cell;
        UITextField *textField = textFieldCell.textField;
        textField.text = self.placemark.street;
    }
    else if ([cell.field.key isEqualToString:@"zipcode"]) {
        FXFormTextFieldCell *textFieldCell = (FXFormTextFieldCell *)cell;
        UITextField *textField = textFieldCell.textField;
        textField.text = self.placemark.zipcode;
    }
}

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"保存") style:UIBarButtonItemStylePlain target:self action:@selector(onSaveButtonPressed:)];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    //reload city base on country
    //[[self.formController tableView] reloadData];
}

- (void)onSaveButtonPressed:(id)sender {

    [self.navigationController popViewControllerAnimated:YES];

}

@end
