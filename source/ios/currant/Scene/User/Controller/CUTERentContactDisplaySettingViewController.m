//
//  CUTERentContactDisplaySettingViewController.m
//  currant
//
//  Created by Foster Yin on 6/12/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentContactDisplaySettingViewController.h"
#import "CUTECommonMacro.h"
#import "CUTETracker.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEDataManager.h"
#import "CUTERentTicketPublisher.h"
#import "CUTENotificationKey.h"
#import "CUTERentTypeListViewController.h"
#import "CUTERentAddressMapViewController.h"
#import "CUTERentPropertyInfoViewController.h"
#import "CUTERentTicketPreviewViewController.h"
#import "CUTERentContactDisplaySettingForm.h"
#import "Sequencer.h"
#import "CUTEAPIManager.h"
#import "CUTEUsageRecorder.h"
#import "NSArray+ObjectiveSugar.h"

@interface CUTERentContactDisplaySettingViewController ()

@end

@implementation CUTERentContactDisplaySettingViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    CUTERentContactDisplaySettingForm *form = (CUTERentContactDisplaySettingForm *)self.formController.form;
    if (form.singleUseForReedit) {
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"RentContactDisplaySetting/发布") style:UIBarButtonItemStylePlain target:self action:@selector(onSubmitButtonPressed:)];
    }
   
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


- (void)onSubmitButtonPressed:(id)sender {
    CUTERentContactDisplaySettingForm *form = (CUTERentContactDisplaySettingForm *)self.formController.form;
    NSError *error = [form validateFormWithScenario:nil];
    if (error) {
        [SVProgressHUD showErrorWithError:error];
        return;
    }

    TrackEvent(GetScreenName(self), kEventActionPress, @"publish", nil);

    NSMutableDictionary *userParams = [NSMutableDictionary dictionary];
    NSMutableArray *privateContactMethods = [NSMutableArray array];
    if (!form.displayPhone) {
        [privateContactMethods addObject:@"phone"];
    }
    if (!form.displayEmail) {
        [privateContactMethods addObject:@"email"];
    }
    if (IsNilNullOrEmpty(form.wechat)) {
        [privateContactMethods addObject:@"wechat"];
    }
    else {
        [userParams setObject:form.wechat forKey:@"wechat"];
    }
    [userParams setObject:[privateContactMethods componentsJoinedByString:@","] forKey:@"private_contact_methods"];

    
    Sequencer *sequencer = [Sequencer new];
    [SVProgressHUD showWithStatus:STR(@"RentContactDisplaySetting/发布中...")];
    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        //user may update user info after create user in the send verification code process, like update private contact methods
        [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/edit" parameters:userParams resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
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
                [[CUTEDataManager sharedInstance] saveUser:task.result];
                completion(task.result);
            }

            return task;
        }];
    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {

        [[[CUTERentTicketPublisher sharedInstance] publishTicket:self.ticket updateStatus:^(NSString *status) {
            [SVProgressHUD showWithStatus:status];
        }] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                [SVProgressHUD showErrorWithError:task.error];
            }
            else {
                [[CUTEUsageRecorder sharedInstance] savePublishedTicketWithId:self.ticket.identifier];
                TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));

                NSArray *screenNames = [[self.navigationController viewControllers] map:^id(UIViewController *object) {
                    return GetScreenName(object);
                }];
                //Notice: one only one ticket in publishing, so not calculate the duration base on different ticket
                TrackScreensStayDuration(KEventCategoryPostRentTicket, screenNames);
                [SVProgressHUD showSuccessWithStatus:STR(@"RentContactDisplaySetting/发布成功")];
                [self.navigationController popToRootViewControllerAnimated:NO];

                dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_PUBLISH object:self userInfo:@{@"ticket": self.ticket}];
                });
            }
            return nil;
        }];
    }];

    [sequencer run];


}

@end
