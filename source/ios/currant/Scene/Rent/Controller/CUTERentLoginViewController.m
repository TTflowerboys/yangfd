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
#import "CUTEDataManager.h"
#import "FXFormViewController+CUTEForm.h"

@implementation CUTERentLoginViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"登录");
}

- (void)submit {
    if (![self validateFormWithScenario:@""]) {
        return;
    }

    [SVProgressHUD showWithStatus:STR(@"发布中...")];
    CUTETicket *ticket = self.ticket;
    CUTERentLoginForm *form = (CUTERentLoginForm *)self.formController.form;

    Sequencer *sequencer = [Sequencer new];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/login" parameters:@{@"country":form.country.identifier, @"phone": form.phone, @"password": [form.password base64EncodedString]} resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                [SVProgressHUD showErrorWithError:task.error];
            }
            else {
                [[CUTEDataManager sharedInstance] saveAllCookies];
                [[CUTEDataManager sharedInstance] saveUser:task.result];
                completion(task.result);
            }
            return nil;
        }];
    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[[CUTERentTickePublisher sharedInstance] publishTicket:ticket] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                [SVProgressHUD showErrorWithError:task.error];
                return nil;
            } else {
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


@end
