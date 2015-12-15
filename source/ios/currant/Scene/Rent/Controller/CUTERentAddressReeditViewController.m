//
//  CUTEAddressReeditViewController.m
//  currant
//
//  Created by Foster Yin on 12/15/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import "CUTERentAddressReeditViewController.h"
#import <UIAlertView+Blocks.h>
#import "CUTENavigationUtil.h"
#import "CUTECommonMacro.h"
#import "CUTERentMapReeditViewController.h"

@interface CUTERentAddressReeditViewController ()

@end

@implementation CUTERentAddressReeditViewController

#pragma -mark Lifecycle

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.leftBarButtonItem = [CUTENavigationUtil backBarButtonItemWithTarget:self action:@selector(onLeftButtonPressed:)];
}

#pragma -mark Action

- (void)onLeftButtonPressed:(id)sender {
    if (IsNilNullOrEmpty(self.form.ticket.property.zipcode)) {
        [UIAlertView showWithTitle:STR(@"RentAddressEdit/请填写Postcode") message:nil cancelButtonTitle:nil otherButtonTitles:@[STR(@"RentAddressEdit/OK")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
        }];
        return;
    }
    else if (self.updateLocationFromAddressFailed) {

        [UIAlertView showWithTitle:STR(@"RentAddressEdit/新Postcode定位失败，前往地图手动修改房产位置，返回房产信息则不添加房产位置") message:nil cancelButtonTitle:STR(@"RentAddressEdit/返回") otherButtonTitles:@[STR(@"RentAddressEdit/前往地图")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {

            if (buttonIndex == alertView.cancelButtonIndex) {
                [self clearTicketLocation];
                [self.navigationController popViewControllerAnimated:YES];
            }
            else {
                [self onLocationEdit:nil];
            }
        }];

        self.updateLocationFromAddressFailed = NO;
        return;
    }
    else if ((IsNilOrNull(self.form.ticket.property.latitude) || IsNilOrNull(self.form.ticket.property.longitude))) {

        [UIAlertView showWithTitle:STR(@"RentAddressEdit/请前往地图手动修改房产位置，返回房产信息则不添加房产位置") message:nil cancelButtonTitle:STR(@"RentAddressEdit/返回") otherButtonTitles:@[STR(@"RentAddressEdit/前往地图")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {

            if (buttonIndex == alertView.cancelButtonIndex) {
                [self.navigationController popViewControllerAnimated:YES];
            }
            else {
                [self onLocationEdit:nil];
            }
        }];
        return;
    }

    [self.navigationController popViewControllerAnimated:YES];
}


- (void)onLocationEdit:(id)sender {
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    CUTERentMapReeditViewController *mapController = [CUTERentMapReeditViewController new];
    CUTERentAddressMapForm *mapForm = [CUTERentAddressMapForm new];
    mapForm.ticket = form.ticket;
    mapController.form = mapForm;
    mapController.hidesBottomBarWhenPushed = YES;

    NSString *oldPostcode = form.postcode;
    [mapController aspect_hookSelector:@selector(viewWillDisappear:) withOptions:AspectPositionAfter | AspectOptionAutomaticRemoval usingBlock:^(id<AspectInfo> info) {
        [SVProgressHUD show];
        [[form updateWithTicket:form.ticket] continueWithBlock:^id(BFTask *task) {
            if (task.error) {
                [SVProgressHUD showErrorWithError:task.error];
            }
            else if (task.exception) {
                [SVProgressHUD showErrorWithException:task.exception];
            }
            else if (task.isCancelled) {
                [SVProgressHUD showErrorWithCancellation];
            }
            else {
                [SVProgressHUD dismiss];
                [self.formController updateSections];
                [self.tableView reloadData];

                if (![oldPostcode isEqualToString:form.postcode]) {
                    if (self.notifyPostcodeChangedBlock) {
                        self.notifyPostcodeChangedBlock();
                    }
                }
            }

            return task;
        }];
    } error:nil];

    [self.navigationController pushViewController:mapController animated:YES];
}


@end
