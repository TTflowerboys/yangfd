//
//  CUTERentPasswordViewController.m
//  currant
//
//  Created by Foster Yin on 5/18/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPasswordViewController.h"
#import "CUTEDataManager.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEAPIManager.h"
#import "CUTECommonMacro.h"
#import "CUTEFormVerificationCodeCell.h"
#import "CUTERentPasswordForm.h"
#import "Sequencer.h"
#import "Base64.h"

@interface CUTERentPasswordViewController () {

    NSString *_userIdentifier;

}

@end


@implementation CUTERentPasswordViewController

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    if ([cell isKindOfClass:[CUTEFormVerificationCodeCell class]]) {
        CUTEFormVerificationCodeCell *codeCell = (CUTEFormVerificationCodeCell *)cell;
        [codeCell.verificationButton addTarget:self action:@selector(onVerificationButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
    }
}

- (void)optionBack {
    [self.navigationController popViewControllerAnimated:YES];
}

- (void)makeVerficationCodeTextFieldBecomeFirstResponder {

    FXFormField *field = [[self formController] fieldForKey:@"code"];
    NSIndexPath *indexPath = [[self formController] indexPathForField:field];
    UITableViewCell *cell = [self.tableView cellForRowAtIndexPath:indexPath];

    if ([cell isKindOfClass:[CUTEFormVerificationCodeCell class]]) {
        CUTEFormVerificationCodeCell *codeCell = (CUTEFormVerificationCodeCell *)cell;
        [codeCell.textField becomeFirstResponder];
    }
}


- (void)startVerficationCodeCountDown {

    FXFormField *field = [[self formController] fieldForKey:@"code"];
    NSIndexPath *indexPath = [[self formController] indexPathForField:field];
    UITableViewCell *cell = [self.tableView cellForRowAtIndexPath:indexPath];

    if ([cell isKindOfClass:[CUTEFormVerificationCodeCell class]]) {
        CUTEFormVerificationCodeCell *codeCell = (CUTEFormVerificationCodeCell *)cell;
        [codeCell startCountDownWithCompletion:nil];
    }
}


- (void)onVerificationButtonPressed:(id)sender {
    if (![self validateFormWithScenario:@"fetchCode"]) {
        return;
    }

    [self makeVerficationCodeTextFieldBecomeFirstResponder];
    [SVProgressHUD showWithStatus:STR(@"发送中...")];
    CUTECountry *country = [[self.formController fieldForKey:@"country"] value];
    NSString *phone = [[self.formController fieldForKey:@"phone"] value];
    [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/sms_verification/send" parameters:@{@"phone":CONCAT(@"+", NilNullToEmpty(country.countryCode.stringValue), NilNullToEmpty(phone))} resultClass:nil] continueWithBlock:^id(BFTask *task) {
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
            _userIdentifier = task.result;
            [self startVerficationCodeCountDown];
            [SVProgressHUD showSuccessWithStatus:STR(@"发送成功")];
        }

        return task;
    }];
}


- (void)reset {
    if (![self validateFormWithScenario:@""]) {
        return;
    }
    if (!_userIdentifier) {
        [SVProgressHUD showErrorWithStatus:STR(@"请获取验证码")];
        return;
    }

    CUTERentPasswordForm *form = (CUTERentPasswordForm *)self.formController.form;
    NSDictionary *params = @{@"code": form.code, @"new_password": [form.password base64EncodedString]};
    [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/user/", _userIdentifier, @"/sms_reset_password") parameters:params resultClass:nil] continueWithBlock:^id(BFTask *task) {
        if (task.error) {
            if ([task.error.domain isEqualToString:@"BBTAPIDomain"] && task.error.code == 40100) {
                [SVProgressHUD showErrorWithStatus:STR(@"验证码不正确")];
            }
            else {
                [SVProgressHUD showErrorWithError:task.error];
            }
        }
        else if (task.exception) {
            [SVProgressHUD showErrorWithException:task.exception];
        }
        else if (task.isCancelled) {
            [SVProgressHUD showErrorWithCancellation];
        }
        else {
            [SVProgressHUD showSuccessWithStatus:STR(@"修改成功")];
            [self.navigationController popViewControllerAnimated:YES];
        }

        return task;
    }];


}

@end
