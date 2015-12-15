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
#import "CUTERentMapEditViewController.h"
#import <NSArray+ObjectiveSugar.h>
#import "CUTERentContactDisplaySettingViewController.h"
#import "currant-Swift.h"

@implementation CUTERentTicketPreviewViewController

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    TrackScreen(GetScreenName(self));
}

- (void)updateTitleWithURL:(NSURL *)url {
    if (!self.navigationItem.title) {
        self.navigationItem.title = STR(@"RentTicketPreview/预览房源移动主页");
    }
}

- (void)updateBackButton {
    if (!self.navigationItem.leftBarButtonItem) {
        self.navigationItem.leftBarButtonItem = [CUTENavigationUtil backBarButtonItemWithTarget:self action:@selector(onLeftButtonPressed:)];
    }
}

- (void)updateRightButtonWithURL:(NSURL *)url {
    if (!self.navigationItem.rightBarButtonItem) {
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"RentTicketPreview/继续") style:UIBarButtonItemStylePlain target:self action:@selector(onContinueButtonPressed:)];
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
        controller.navigationItem.title = STR(@"RentTicketPreview/确认联系方式展示");
        [self.navigationController pushViewController:controller animated:YES];
    }
    else {
        CUTETicket *ticket = self.ticket;
        [self.navigationController openRouteWithURL:[NSURL URLWithString:CONCAT(@"yangfd://signup/?", @"from_edit_ticket=true", @"&ticket_id=", ticket.identifier)]];
    }
}


@end
