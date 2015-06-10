//
//  CUTEApplyBetaRentingViewController.m
//  currant
//
//  Created by Foster Yin on 5/26/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEApplyBetaRentingViewController.h"
#import "CUTECommonMacro.h"
#import "CUTEApplyBetaRentingForm.h"
#import "CUTEAPIManager.h"
#import "SVProgressHUD+CUTEAPI.h"
#import <ALActionBlocks.h>
#import "CUTEEnumManager.h"
#import "CUTERentContactForm.h"
#import "CUTERentContactViewController.h"
#import "UIAlertView+Blocks.h"

@implementation CUTEApplyBetaRentingViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"邀请码");

    CUTEApplyBetaRentingForm *form = (CUTEApplyBetaRentingForm *)self.formController.form;
    if (form.singleUse) {
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"注册") style:UIBarButtonItemStylePlain block:^(id weakSender) {
            [SVProgressHUD show];
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
                    CUTERentContactViewController *contactViewController = [CUTERentContactViewController new];
                    CUTERentContactForm *form = [CUTERentContactForm new];
                    form.isOnlyRegister = YES;
                    form.isInvitationCodeRequired = YES;
                    [form setAllCountries:task.result];
                    contactViewController.formController.form = form;
                    [self.navigationController pushViewController:contactViewController animated:YES];
                    [SVProgressHUD dismiss];
                }
                
                return task;
            }];
        }];
    }
}

- (BOOL)validate {
    BOOL formValidation = [self validateFormWithScenario:@"submit"];
    if (!formValidation) {
        return NO;
    }

    return YES;
}

- (void)submit {

    if (![self validate]) {
        return;
    }

    [SVProgressHUD show];
    CUTEApplyBetaRentingForm *form = (CUTEApplyBetaRentingForm *)self.formController.form;

    [[[CUTEAPIManager sharedInstance] POST:@"/api/1/subscription/add" parameters:@{@"email": form.email} resultClass:nil] continueWithBlock:^id(BFTask *task) {
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
            [UIAlertView showWithTitle:STR(@"申请成功") message:STR(@"我们会尽快处理，请定期检查您的邮件") cancelButtonTitle:STR(@"OK") otherButtonTitles:nil tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
            }];
            [self.navigationController popToRootViewControllerAnimated:YES];
        }

        return task;
    }];
}

@end
