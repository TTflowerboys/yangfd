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

@implementation CUTEApplyBetaRentingViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"邀请码");
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
            [SVProgressHUD showSuccessWithStatus:STR(@"申请成功")];
            [self.navigationController popToRootViewControllerAnimated:YES];
        }

        return task;
    }];
}

@end
