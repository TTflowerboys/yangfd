//
//  CUTERentPassword2ViewController.m
//  currant
//
//  Created by Foster Yin on 8/8/15.
//  Copyright © 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPassword2ViewController.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEAPIManager.h"
#import "CUTERentPassword2Form.h"
#import "CUTECommonMacro.h"

@interface CUTERentPassword2ViewController ()

@end

@implementation CUTERentPassword2ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


- (void)onVerificationButtonPressed:(id)sender {
    if (![self validateFormWithScenario:@"fetchCode"]) {
        return;
    }

}


- (void)reset {
    if (![self validateFormWithScenario:@""]) {
        return;
    }

    [SVProgressHUD show];
    CUTERentPassword2Form *form = (CUTERentPassword2Form *)self.formController.form;
    [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/email_recovery/send" parameters:@{@"email":form.email} resultClass:nil] continueWithBlock:^id(BFTask *task) {
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
            [SVProgressHUD showSuccessWithStatus:STR(@"RentPassword2/重置密码请求已发送，请前往邮箱查看重置密码邮件")];
            [self.navigationController popViewControllerAnimated:YES];
        }
        
        return task;
    }];
}


@end
