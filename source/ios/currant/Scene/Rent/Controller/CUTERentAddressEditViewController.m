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
#import "CUTEDataManager.h"
#import "CUTERentTicketPublisher.h"
#import "CUTENotificationKey.h"
#import <UIAlertView+Blocks.h>
#import "CUTEPlacemark.h"
#import "NSArray+ObjectiveSugar.h"
#import "CUTEPostcodePlace.h"
#import "CUTEAddressUtil.h"
#import "CUTENavigationUtil.h"
#import "Aspects.h"
#import "currant-Swift.h"

@interface CUTERentAddressEditViewController () {
}

@end


@implementation CUTERentAddressEditViewController

#pragma -mark Lifecycle

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.leftBarButtonItem = [CUTENavigationUtil backBarButtonItemWithTarget:self action:@selector(onLeftButtonPressed:)];

    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"RentAddressEdit/继续") style:UIBarButtonItemStylePlain target:self action:@selector(onContinueButtonPressed:)];
}

#pragma -mark Action

- (void)onLeftButtonPressed:(id)sender {
    if (IsNilNullOrEmpty(self.form.ticket.property.zipcode)) {
        [UIAlertView showWithTitle:STR(@"RentAddressEdit/请填写Postcode") message:nil cancelButtonTitle:nil otherButtonTitles:@[STR(@"RentAddressEdit/OK")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
        }];
        return;
    }
    else if ((IsNilOrNull(self.form.ticket.property.latitude) || IsNilOrNull(self.form.ticket.property.longitude))) {
        [UIAlertView showWithTitle:STR(@"RentAddressEdit/定位不到房产位置，请返回地图更新房产位置") message:nil cancelButtonTitle:nil otherButtonTitles:@[STR(@"RentAddressEdit/返回")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
            [self.navigationController popViewControllerAnimated:YES];
        }];
        return;
    }

    [self.navigationController popViewControllerAnimated:YES];
}


- (void)onContinueButtonPressed:(id)sender {
    if (![self validateForm]) {
        return;
    }


    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    if (self.updateLocationFromAddressFailed) {
        [UIAlertView showWithTitle:STR(@"RentAddressEdit/新Postcode定位失败，返回地图手动修改房产位置，继续下一步则不添加房产位置") message:nil cancelButtonTitle:STR(@"RentAddressEdit/返回") otherButtonTitles:@[STR(@"RentAddressEdit/下一步")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
            if (buttonIndex == alertView.cancelButtonIndex) {
                [self.navigationController popViewControllerAnimated:YES];
            }
            else {
                [self clearTicketLocation];
                [self createTicket];
            }
        }];

        self.updateLocationFromAddressFailed = NO;
        return;
    }
    else if (IsNilOrNull(form.ticket.property.latitude) || IsNilOrNull(form.ticket.property.longitude)) {
        [UIAlertView showWithTitle:STR(@"RentAddressEdit/请返回地图手动修改房产位置，继续下一步则不添加房产位置") message:nil cancelButtonTitle:STR(@"RentAddressEdit/返回") otherButtonTitles:@[STR(@"RentAddressEdit/下一步")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
            if (buttonIndex == alertView.cancelButtonIndex) {
                [self.navigationController popViewControllerAnimated:YES];
            }
            else {
                [self createTicket];
            }
        }];

        return;
    }
    
    [self createTicket];
}

@end
