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
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"RentTicketPreview/发布") style:UIBarButtonItemStylePlain target:self action:@selector(onContinueButtonPressed:)];
    }
}

- (void)onLeftButtonPressed:(id)sender {
    TrackEvent(GetScreenName(self), kEventActionPress, @"return-to-edit", nil);
    [self.navigationController popViewControllerAnimated:YES];
}


- (void)onContinueButtonPressed:(id)sender {

    TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));
    if ([CUTEDataManager sharedInstance].isUserLoggedIn) {

        [SVProgressHUD showWithStatus:STR(@"RentContactDisplaySetting/发布中...")];
        [[[CUTERentTicketPublisher sharedInstance] publishTicket:self.ticket updateStatus:^(NSString *status) {
            [SVProgressHUD showWithStatus:status];
        }] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                [SVProgressHUD showErrorWithError:task.error];
            }
            else {
                [[CUTEUsageRecorder sharedInstance] savePublishedTicketWithId:self.ticket.identifier];
                TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));

                NSArray *screenNames = [[self.navigationController viewControllers] map:^id(UIViewController *object) {
                    if ([object isKindOfClass:[CUTEWebViewController class]]) {
                        return GetScreenName([(CUTEWebViewController *)object URL]);
                    }
                    return GetScreenName(object);
                }];
                //Notice: one only one ticket in publishing, so not calculate the duration base on different ticket
                TrackScreensStayDuration(KEventCategoryPostRentTicket, screenNames);
                [SVProgressHUD showSuccessWithStatus:STR(@"RentContactDisplaySetting/发布成功")];
                [self.navigationController popToRootViewControllerAnimated:NO];

                dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_PUBLISH object:self userInfo:@{@"ticket": self.ticket}];
                });
            }
            return nil;
        }];
    }
    else {
        CUTETicket *ticket = self.ticket;
        [self.navigationController openRouteWithURL:[NSURL URLWithString:CONCAT(@"yangfd://signup/?", @"from_edit_ticket=true", @"&ticket_id=", ticket.identifier)]];
    }
}


@end
