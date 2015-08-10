//
//  CUTERentTicketPreviewController.m
//  currant
//
//  Created by Foster Yin on 5/6/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentTicketPreviewViewController.h"
#import "CUTENavigationUtil.h"
#import "CUTECommonMacro.h"
#import "CUTEDataManager.h"
#import "CUTEAPICacheManager.h"
#import "CUTEAPIManager.h"
#import "CUTENotificationKey.h"
#import "CUTERentTicketPublisher.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTERentContactViewController.h"
#import "CUTERentContactForm.h"
#import "CUTETracker.h"
#import "CUTERentTypeListViewController.h"
#import "CUTERentAddressMapViewController.h"
#import "CUTERentPropertyInfoViewController.h"
#import <NSArray+ObjectiveSugar.h>
#import "CUTERentContactDisplaySettingViewController.h"

@implementation CUTERentTicketPreviewViewController

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    TrackScreen(GetScreenName(self));
}

- (void)updateTitleWithURL:(NSURL *)url {
    if (!self.navigationItem.title) {
        self.navigationItem.title = STR(@"预览房源移动主页");
    }
}

- (void)updateBackButton {
    if (!self.navigationItem.leftBarButtonItem) {
        self.navigationItem.leftBarButtonItem = [CUTENavigationUtil backBarButtonItemWithTarget:self action:@selector(onLeftButtonPressed:)];
    }
}

- (void)updateRightButtonWithURL:(NSURL *)url {
    if (!self.navigationItem.rightBarButtonItem) {
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"继续") style:UIBarButtonItemStylePlain target:self action:@selector(onContinueButtonPressed:)];
    }
}

- (void)onLeftButtonPressed:(id)sender {
    TrackEvent(GetScreenName(self), kEventActionPress, @"return-to-edit", nil);
    [self.navigationController popViewControllerAnimated:YES];
}


- (void)onContinueButtonPressed:(id)sender {

    TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));
    if ([CUTEDataManager sharedInstance].isUserLoggedIn) {
        CUTERentContactDisplaySettingViewController *controller = [CUTERentContactDisplaySettingViewController new];
        CUTERentContactDisplaySettingForm *form = [CUTERentContactDisplaySettingForm new];
        CUTEUser *user = [CUTEDataManager sharedInstance].user;
        form.displayPhone = ![user.privateContactMethods containsObject:@"phone"];
        form.displayEmail = ![user.privateContactMethods containsObject:@"email"];
        form.wechat = user.wechat;
        form.singleUseForReedit = YES;
        controller.formController.form = form;
        controller.ticket = self.ticket;
        controller.navigationItem.title = STR(@"确认联系方式展示");
        [self.navigationController pushViewController:controller animated:YES];
    }
    else {
        CUTETicket *ticket = self.ticket;
        CUTEProperty *property = ticket.property;
        [SVProgressHUD show];
        [[[CUTEAPICacheManager sharedInstance] getCountriesWithCountryCode:YES] continueWithBlock:^id(BFTask *task) {
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
                CUTERentContactViewController *contactViewController = [CUTERentContactViewController new];
                contactViewController.ticket = self.ticket;
                CUTERentContactForm *form = [CUTERentContactForm new];
                [form setAllCountries:task.result];
                //set default country same with the property
                if (property.country) {
                    form.country = [task.result find:^BOOL(CUTECountry *object) {
                        return [object.ISOcountryCode isEqualToString:property.country.ISOcountryCode];
                    }];
                }
                contactViewController.formController.form = form;
                [self.navigationController pushViewController:contactViewController animated:YES];
                [SVProgressHUD dismiss];
            }

            return task;
        }];
    }
}


@end
