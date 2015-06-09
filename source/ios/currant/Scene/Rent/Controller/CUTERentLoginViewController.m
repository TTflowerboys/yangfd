//
//  CUTERentLoginViewController.m
//  currant
//
//  Created by Foster Yin on 4/29/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentLoginViewController.h"
#import "CUTECommonMacro.h"
#import "CUTERentLoginForm.h"
#import "CUTEUser.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTETicket.h"
#import "CUTERentTickePublisher.h"
#import "CUTEAPIManager.h"
#import "CUTENotificationKey.h"
#import <Base64.h>
#import <Sequencer/Sequencer.h>
#import <NSArray+ObjectiveSugar.h>
#import "CUTEDataManager.h"
#import "CUTENotificationKey.h"
#import "CUTETracker.h"
#import "CUTERentTypeListViewController.h"
#import "CUTERentAddressMapViewController.h"
#import "CUTERentPropertyInfoViewController.h"
#import "CUTERentContactViewController.h"
#import "CUTERentTicketPreviewViewController.h"
#import "CUTERentPasswordViewController.h"
#import "CUTERentPasswordForm.h"
#import "CUTEEnumManager.h"
#import "CUTEFormTextFieldCell.h"
#import "CUTEApplyBetaRentingViewController.h"
#import "CUTEUserDefaultKey.h"
#import "CUTEApplyBetaRentingForm.h"
#import "CUTETooltipView.h"
#import "JDFTooltipManager.h"

@implementation CUTERentLoginViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"登录");
}

- (void)optionBack {
    [self.navigationController popViewControllerAnimated:YES];
}

- (void)resetPassword {
    [[[CUTEEnumManager sharedInstance] getCountriesWithCountryCode:YES] continueWithBlock:^id(BFTask *task) {
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
            TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));
            CUTERentPasswordViewController *controller = [CUTERentPasswordViewController new];
            CUTERentPasswordForm *form = [CUTERentPasswordForm new];
            [form setAllCountries:task.result];
            //set default country same with the property
            if (self.ticket.property.country) {
                form.country = [task.result find:^BOOL(CUTECountry *object) {
                    return [object.code isEqualToString:self.ticket.property.country.code];
                }];
            }
            controller.formController.form = form;
            controller.navigationItem.title = STR(@"重置密码");
            [self.navigationController pushViewController:controller animated:YES];

        }

        return task;
    }];
}

- (void)onPasswordEdit:(CUTEFormTextFieldCell *)cell {
    //if has password input, we think the user want to login
    if (!IsNilNullOrEmpty(cell.textField.text)) {
        [self submit];
    }
}

- (void)submit {
    if (![self validateFormWithScenario:@""]) {
        return;
    }

    CUTERentLoginForm *form = (CUTERentLoginForm *)self.formController.form;
    if (form.isOnlyRegister) {
        [SVProgressHUD showWithStatus:STR(@"登录中...")];
        [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/login" parameters:@{@"country":form.country.code, @"phone": form.phone, @"password": [form.password base64EncodedString]} resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                [SVProgressHUD showErrorWithError:task.error];
            }
            else {
                CUTEUser *user = task.result;
                if ([user hasRole:kUserRoleBetaRenting]) {
                    [SVProgressHUD dismiss];
                    [[CUTEDataManager sharedInstance] saveAllCookies];
                    [[CUTEDataManager sharedInstance] saveUser:task.result];
                    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_USER_DID_LOGIN object:self];

                    [[NSUserDefaults standardUserDefaults] setBool:YES forKey:CUTE_USER_DEFAULT_BETA_USER_REGISTERED];
                    [[NSUserDefaults standardUserDefaults] synchronize];
                    [self dismissViewControllerAnimated:YES completion:^{
                        [NotificationCenter postNotificationName:KNOTIF_BETA_USER_DID_REGISTER object:nil];
                    }];
                }
                else {
                    [SVProgressHUD showSuccessWithStatus:STR(@"您还没有内测权限，请申请测试邀请码")];
                    CUTEApplyBetaRentingViewController *controller = [CUTEApplyBetaRentingViewController new];
                    controller.formController.form = [CUTEApplyBetaRentingForm new];
                    [self.navigationController pushViewController:controller animated:YES];
                }
            }
            return nil;
        }];

    }
    else {
        [SVProgressHUD showWithStatus:STR(@"登录中...")];
        CUTETicket *ticket = self.ticket;

        Sequencer *sequencer = [Sequencer new];

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/login" parameters:@{@"country":form.country.code, @"phone": form.phone, @"password": [form.password base64EncodedString]} resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                }
                else {
                    [[CUTEDataManager sharedInstance] saveAllCookies];
                    [[CUTEDataManager sharedInstance] saveUser:task.result];
                    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_USER_DID_LOGIN object:self];
                    completion(task.result);
                }
                return nil;
            }];
        }];

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[[CUTERentTickePublisher sharedInstance] publishTicket:ticket updateStatus:^(NSString *status) {
                [SVProgressHUD showWithStatus:status];
            }] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                    return nil;
                } else {
                    TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));

                    NSArray *screeNames = @[GetScreenNameFromClass([CUTERentTypeListViewController class]),
                                            GetScreenNameFromClass([CUTERentAddressMapViewController class]),
                                            GetScreenNameFromClass([CUTERentPropertyInfoViewController class]),
                                            GetScreenNameFromClass([CUTERentTicketPreviewViewController class]),
                                            GetScreenNameFromClass([CUTERentContactViewController class]),
                                            GetScreenNameFromClass([CUTERentLoginViewController class])];
                    TrackScreensStayDuration(KEventCategoryPostRentTicket, screeNames);
                    [SVProgressHUD dismiss];
                    [self.navigationController popToRootViewControllerAnimated:NO];
                    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_PUBLISH object:self userInfo:@{@"ticket": ticket}];
                    });
                    return nil;
                }
                return nil;
            }];

        }];

        [sequencer run];
    }
}


@end
