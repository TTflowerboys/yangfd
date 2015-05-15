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
#import "CUTEEnumManager.h"
#import "CUTEAPIManager.h"
#import "CUTENotificationKey.h"
#import "CUTERentTickePublisher.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTERentContactViewController.h"
#import "CUTERentContactForm.h"
#import "CUTETracker.h"
#import "CUTERentTypeListViewController.h"
#import "CUTERentAddressMapViewController.h"
#import "CUTERentPropertyInfoViewController.h"

@implementation CUTERentTicketPreviewViewController

- (void)updateTitleWithURL:(NSURL *)url {
    if (!self.navigationItem.title) {
        self.navigationItem.title = STR(@"预览");
    }
}

- (void)updateBackButton {
    if (!self.navigationItem.leftBarButtonItem) {
        self.navigationItem.leftBarButtonItem = [CUTENavigationUtil backBarButtonItemWithTarget:self action:@selector(onLeftButtonPressed:)];
    }
}

- (void)updateRightButtonWithURL:(NSURL *)url {
    if (!self.navigationItem.rightBarButtonItem) {
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"发布") style:UIBarButtonItemStylePlain target:self action:@selector(onSubmitButtonPressed:)];
    }
}

- (void)onLeftButtonPressed:(id)sender {
    TrackEvent(GetScreenName(self), kEventActionPress, @"return-to-edit", nil);
    [self.navigationController popViewControllerAnimated:YES];
}

- (void)onSubmitButtonPressed:(id)sender {
    TrackEvent(GetScreenName(self), kEventActionPress, @"publish", nil);
    CUTETicket *ticket = self.ticket;
    CUTEProperty *property = ticket.property;

    if (ticket && property) {
        if ([CUTEDataManager sharedInstance].isUserLoggedIn) {
            [SVProgressHUD showWithStatus:STR(@"发布中...")];
            [[[CUTERentTickePublisher sharedInstance] publishTicket:ticket updateStatus:^(NSString *status) {
                [SVProgressHUD showWithStatus:status];
            }] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                }
                else {
                    TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));

                    NSArray *screeNames = @[GetScreenNameFromClass([CUTERentTypeListViewController class]),
                                            GetScreenNameFromClass([CUTERentAddressMapViewController class]),
                                            GetScreenNameFromClass([CUTERentPropertyInfoViewController class]),
                                            GetScreenNameFromClass([CUTERentTicketPreviewViewController class])];
                    TrackScreensStayDuration(KEventCategoryPostRentTicket, screeNames);
                    [SVProgressHUD showSuccessWithStatus:STR(@"发布成功")];
                    [self.navigationController popToRootViewControllerAnimated:NO];

                    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_PUBLISH object:self userInfo:@{@"ticket": ticket}];
                    });
                }
                return nil;
            }];
        }
        else {
            [SVProgressHUD show];
            [[[CUTEEnumManager sharedInstance] getEnumsByType:@"country"] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                    return nil;
                } else {
                    CUTERentContactViewController *contactViewController = [CUTERentContactViewController new];
                    contactViewController.ticket = self.ticket;
                    CUTERentContactForm *form = [CUTERentContactForm new];
                    [form setAllCountries:task.result];
                    //set default country same with the property
                    form.country = property.country;
                    contactViewController.formController.form = form;
                    [self.navigationController pushViewController:contactViewController animated:YES];
                    [SVProgressHUD dismiss];
                    return nil;
                }
            }];
        }
    }

}

@end
