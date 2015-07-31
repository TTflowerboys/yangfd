//
//  CUTERentConfirmPhoneViewController.m
//  currant
//
//  Created by Foster Yin on 7/29/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentConfirmPhoneViewController.h"
#import "CUTERentVerifyPhoneViewController.h"
#import "CUTERentVerifyPhoneForm.h"
#import "CUTECommonMacro.h"
#import "CUTERentConfirmPhoneForm.h"
#import "CUTEUser.h"
#import "CUTEDataManager.h"
#import "CUTEAPIManager.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEKeyboardStateListener.h"
#import "UIBarButtonItem+ALActionBlocks.h"

@interface CUTERentConfirmPhoneViewController ()

@end

@implementation CUTERentConfirmPhoneViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    self.navigationItem.title = STR(@"确认手机号");

    self.navigationItem.leftBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"取消") style:UIBarButtonItemStylePlain block:^(id weakSender) {
        [self.navigationController dismissViewControllerAnimated:NO completion:^{

            CUTERentConfirmPhoneForm *form = (CUTERentConfirmPhoneForm *)self.formController.form;
            //if not verified, and disappear, then clear the cookie, let user login again
            if (!form.user.phoneVerified.boolValue) {
                [[CUTEDataManager sharedInstance] clearAllCookies];
            }
        }];
    }];

}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)optionBack {
    [self.navigationController popViewControllerAnimated:YES];
}

- (void)onPhoneEdit:(id)sender {
    CUTERentConfirmPhoneForm *form = (CUTERentConfirmPhoneForm *)self.formController.form;

    if (![form.phone isEqualToString:form.user.phone] || ![form.country isEqual:form.user.country]) {
        [SVProgressHUD showWithStatus:STR(@"更新号码中...")];
        [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/edit" parameters:@{@"phone":form.phone, @"country": form.country.code} resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
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
                form.user.phone = form.phone;
                form.user.country = form.country;

                CUTERentVerifyPhoneViewController *controller = [CUTERentVerifyPhoneViewController new];
                CUTERentVerifyPhoneForm *verifyForm = [CUTERentVerifyPhoneForm new];
                verifyForm.user = form.user;
                controller.formController.form = verifyForm;
                [self.navigationController pushViewController:controller animated:YES];
            }


            return task;
        }];
    }
    else {
        CUTERentVerifyPhoneViewController *controller = [CUTERentVerifyPhoneViewController new];
        CUTERentVerifyPhoneForm *verifyForm = [CUTERentVerifyPhoneForm new];
        verifyForm.user = form.user;
        controller.formController.form = verifyForm;
        [self.navigationController pushViewController:controller animated:YES];
    }
}

- (void)submit {
    //have triggered onEmailEdited, need do nothing
    //when the keyboard dismissed
    if (![CUTEKeyboardStateListener sharedInstance].isVisible) {
        [self onPhoneEdit:nil];
    }
    else {
        //have triggered onPasswordEdit:, need do nothing
    }
}

@end
