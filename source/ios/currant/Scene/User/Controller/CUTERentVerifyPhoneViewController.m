//
//  CUTERentVerifyPhoneViewController.m
//  currant
//
//  Created by Foster Yin on 7/29/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentVerifyPhoneViewController.h"
#import "CUTERentVerifyPhoneForm.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEUser.h"
#import "CUTEDataManager.h"
#import "CUTEAPIManager.h"
#import "CUTECommonMacro.h"
#import "CUTEFormVerificationCodeCell.h"
#import "Sequencer.h"
#import "CUTEConfiguration.h"

@interface CUTERentVerifyPhoneViewController ()

@end

@implementation CUTERentVerifyPhoneViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    self.navigationItem.title = STR(@"验证手机号");
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    if ([cell isKindOfClass:[CUTEFormVerificationCodeCell class]]) {
        CUTEFormVerificationCodeCell *codeCell = (CUTEFormVerificationCodeCell *)cell;
        [codeCell.verificationButton addTarget:self action:@selector(onVerificationButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
    }
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


- (void)onVerificationButtonPressed:(id)sender {

    [self makeVerficationCodeTextFieldBecomeFirstResponder];
    CUTERentVerifyPhoneForm *form = (CUTERentVerifyPhoneForm *)self.formController.form;
    [SVProgressHUD showWithStatus:STR(@"发送中...")];
    [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/sms_verification/send" parameters:@{@"phone": CONCAT(@"+", NilNullToEmpty(form.user.countryCode.stringValue), NilNullToEmpty(form.user.phone))} resultClass:nil] continueWithBlock:^id(BFTask *task) {
        if (task.error || task.exception || task.isCancelled) {
            [SVProgressHUD showErrorWithError:task.error];
        }
        else {
            [SVProgressHUD showSuccessWithStatus:STR(@"发送成功")];
        }
        return nil;
    }];
}


- (void)codeFieldEndEdit {
    CUTERentVerifyPhoneForm *form = (CUTERentVerifyPhoneForm *)self.formController.form;
    //after create can validate the code

    if (form.user) {
        [SVProgressHUD showWithStatus:STR(@"验证中...")];
        [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/user/", form.user.identifier, @"/sms_verification/verify") parameters:@{@"code":form.code} resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
            //update verify status
            if (task.result) {
                form.user.phoneVerified = @(YES);
                [SVProgressHUD showSuccessWithStatus:STR(@"验证成功")];
                [[CUTEDataManager sharedInstance] saveUser:form.user];
                [[CUTEDataManager sharedInstance] persistAllCookies];
                [self.navigationController dismissViewControllerAnimated:YES completion:^{

                }];
            }
            else {
                [SVProgressHUD showErrorWithStatus:STR(@"验证失败")];
            }
            return nil;
        }];
    }
}

@end
