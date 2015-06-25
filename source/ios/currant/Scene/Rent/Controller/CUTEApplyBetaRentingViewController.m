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
#import <ALActionBlocks.h>
#import "UIAlertView+Blocks.h"
#import "CUTENotificationKey.h"
#import "ALActionBlock.h"
#import "SVProgressHUD+CUTEAPI.h"

@implementation CUTEApplyBetaRentingViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"邀请码");
    self.navigationItem.leftBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"返回") style:UIBarButtonItemStylePlain block:^(id weakSender) {
        [self.navigationController dismissViewControllerAnimated:NO completion:^{
            [NotificationCenter postNotificationName:KNOTIF_SHOW_SPLASH_VIEW object:nil];
        }];
    }];
}

- (void)onEmailEdited:(id)sender {
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
                [self.navigationController dismissViewControllerAnimated:NO completion:^{
                    [NotificationCenter postNotificationName:KNOTIF_SHOW_SPLASH_VIEW object:nil];
                }];
            }];
        }

        return task;
    }];
}

- (BOOL)validate {
    BOOL formValidation = [self validateFormWithScenario:@"submit"];
    if (!formValidation) {
        return NO;
    }

    return YES;
}

- (void)submit {
    //have triggered onEmailEdited, need do nothing
}

@end
