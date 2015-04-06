//
//  CUTERentAddressEditViewController.m
//  currant
//
//  Created by Foster Yin on 4/4/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentAddressEditViewController.h"

@implementation CUTERentAddressEditViewController

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    if ([cell isKindOfClass:[FXFormTextFieldCell class]]) {
        FXFormTextFieldCell *textFieldCell = (FXFormTextFieldCell *)cell;

        UITextField *textField = textFieldCell.textField;
        if ([textFieldCell.field.key isEqualToString:@"street"]) {
            textField.text = self.placemark.street;
        }
        else if ([textFieldCell.field.key isEqualToString:@"postCode"]) {
            textField.text = self.placemark.postalCode;
        }
    }
}

@end
