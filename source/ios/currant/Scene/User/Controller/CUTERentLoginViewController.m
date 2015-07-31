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
#import "CUTERentTicketPublisher.h"
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
#import "CUTEAPICacheManager.h"
#import "CUTEFormTextFieldCell.h"
#import "CUTEUserDefaultKey.h"
#import "CUTEApplyBetaRentingForm.h"
#import "CUTETooltipView.h"
#import "JDFTooltipManager.h"
#import "CUTECredit.h"
#import "NSArray+ObjectiveSugar.h"
#import "CUTEKeyboardStateListener.h"
#import "CUTERentContactDisplaySettingViewController.h"
#import "CUTERentContactDisplaySettingForm.h"

@implementation CUTERentLoginViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"登录");
}

- (void)optionBack {
    [self.navigationController popViewControllerAnimated:YES];
}

- (void)resetPassword {
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
            TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));
            CUTERentPasswordViewController *controller = [CUTERentPasswordViewController new];
            CUTERentPasswordForm *form = [CUTERentPasswordForm new];
            [form setAllCountries:task.result];
            //set default country same with the property
            if (self.ticket.property.country) {
                form.country = [task.result find:^BOOL(CUTECountry *object) {
                    return [object.ISOcountryCode isEqualToString:self.ticket.property.country.ISOcountryCode];
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
        [self login];
    }
}

- (void)login {
    if (![self validateFormWithScenario:@""]) {
        return;
    }

    CUTERentLoginForm *form = (CUTERentLoginForm *)self.formController.form;
    if (form.isOnlyRegister) {
        [SVProgressHUD showWithStatus:STR(@"登录中...")];
        [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/login" parameters:@{@"country":form.country.ISOcountryCode, @"phone": form.phone, @"password": [form.password base64EncodedString]} resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                [SVProgressHUD showErrorWithError:task.error];
            }
            else {
                CUTEUser *user = task.result;
                [SVProgressHUD dismiss];


                [self dismissViewControllerAnimated:YES completion:^{
                    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_USER_DID_LOGIN object:self userInfo:@{@"user": user}];
                }];
            }
            return nil;
        }];

    }
    else {
        [SVProgressHUD showWithStatus:STR(@"登录中...")];

        Sequencer *sequencer = [Sequencer new];

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/login" parameters:@{@"country":form.country.ISOcountryCode, @"phone": form.phone, @"password": [form.password base64EncodedString]} resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                }
                else {
                    CUTEUser *user = task.result;
                    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_USER_DID_LOGIN object:self userInfo:@{@"user": user}];
                    completion(task.result);
                }
                return nil;
            }];
        }];

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [SVProgressHUD dismiss];
            
            CUTEUser *user = (CUTEUser *)result;
            CUTERentContactDisplaySettingViewController *controller = [CUTERentContactDisplaySettingViewController new];
            CUTERentContactDisplaySettingForm *form = [CUTERentContactDisplaySettingForm new];
            form.displayPhone = ![user.privateContactMethods containsObject:@"phone"];
            form.displayEmail = ![user.privateContactMethods containsObject:@"email"];
            form.wechat = user.wechat;
            form.singleUseForReedit = YES;
            controller.formController.form = form;
            controller.ticket = self.ticket;
            controller.navigationItem.title = STR(@"确认联系方式展示");
            [self.navigationController pushViewController:controller animated:YES];

        }];
        
        [sequencer run];
    }
}

- (void)submit {
    //when the keyboard dismissed
    if (![CUTEKeyboardStateListener sharedInstance].isVisible) {
         CUTEFormTextFieldCell *passwordCell = (CUTEFormTextFieldCell *)[self.tableView cellForRowAtIndexPath:[NSIndexPath indexPathForRow:2 inSection:0]];
        if (!IsNilNullOrEmpty(passwordCell.textField.text)) {
            [self login];
        }
    }
    else {
        //have triggered onPasswordEdit:, need do nothing
    }
}


@end
