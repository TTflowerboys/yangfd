//
//  CUTERentContactViewController.m
//  currant
//
//  Created by Foster Yin on 4/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentContactViewController.h"
#import "CUTECommonMacro.h"
#import "CUTEFormVerificationCodeCell.h"
#import "CUTEAPIManager.h"
#import "CUTEEnum.h"
#import <WXApi.h>
#import "CUTEUser.h"
#import "CUTERentContactForm.h"
#import <Sequencer.h>
#import "CUTEDataManager.h"
#import "SVProgressHUD+CUTEAPI.h"

@interface CUTERentContactViewController () {

    BOOL _userVerified;

}

@end


@implementation CUTERentContactViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"联系方式");
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"发布到微信") style:UIBarButtonItemStylePlain target:self action:@selector(onRightButtonPressed:)];
    self.navigationItem.rightBarButtonItem.enabled = false;
    UILabel * label = [UILabel new];
    NSString *str = STR(@"确认代表您同意创建一个洋房东账号供以后查看租客请求使用");
    NSMutableAttributedString* attrString = [[NSMutableAttributedString alloc] initWithString:str attributes:@{NSForegroundColorAttributeName: HEXCOLOR(0x999999, 1.0)}];
    NSMutableParagraphStyle *style = [[NSMutableParagraphStyle alloc] init];
    [style setLineSpacing:8];
    [attrString addAttribute:NSParagraphStyleAttributeName
                       value:style
                       range:NSMakeRange(0, str.length)];
    label.attributedText = attrString;
    label.font = [UIFont systemFontOfSize:12];
    label.numberOfLines = 0;
    label.textAlignment = NSTextAlignmentCenter;
    label.frame = CGRectMake(RectWidthExclude(self.view.bounds, 240) / 2, 40, 240, 60);
    UIView *footerView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, ScreenWidth, 100)];
    [footerView addSubview:label];
    self.tableView.tableFooterView = footerView;
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    if ([cell isKindOfClass:[CUTEFormVerificationCodeCell class]]) {
        CUTEFormVerificationCodeCell *codeCell = (CUTEFormVerificationCodeCell *)cell;
        [codeCell.verificationButton addTarget:self action:@selector(onVerificationButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
    }
}

- (BOOL)validateFormWithScenario:(NSString *)scenario {

    CUTERentContactForm *form = (CUTERentContactForm *)self.formController.form;
    form.scenario = scenario;
    if (![form validate]) {
        NSMutableString *message = [NSMutableString string];

        [form.errors enumerateKeysAndObjectsUsingBlock:^(NSString *attribute, NSArray *errors, BOOL *stop) {
            for(NSString *error in errors) {
                [message appendFormat:@"- %@\n", error];
            };
        }];
        [SVProgressHUD showErrorWithStatus:message];
        return NO;
    }
    return YES;
}

- (void)onVerificationButtonPressed:(id)sender {

    if ([CUTEDataManager sharedInstance].user) {
        if (![self validateFormWithScenario:@"sendCode"]) {
            return;
        }
        CUTEEnum *country = [[self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:1 inSection:0]] value];
        NSString *phone = [[self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:2 inSection:0]] value];
        [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/sms_verification/send" parameters:@{@"phone":phone, @"country":country.identifier} resultClass:nil] continueWithBlock:^id(BFTask *task) {
            return nil;
        }];
    }
    else {
        if (![self validateFormWithScenario:@"register"]) {
            return;
        }
        CUTERentContactForm *form = (CUTERentContactForm *)self.formController.form;
        CUTEUser *user = [CUTEUser new];
        user.nickname = form.name;
        user.email = form.email;
        user.country = form.country;
        user.phone = form.phone;
        [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/mobile-register" parameters:[user toParams] resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                return nil;
            } else {
                [[CUTEDataManager sharedInstance] setUser:task.result];
                return nil;
            }
        }];
    }
}

- (void)codeFieldEndEdit {
    CUTERentContactForm *form = (CUTERentContactForm *)self.formController.form;
    //after create can validate the code
    if ([CUTEDataManager sharedInstance].user) {
        [SVProgressHUD showWithStatus:STR(@"验证中...")];
        [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/user/", [CUTEDataManager sharedInstance].user.identifier, @"/sms_verification/verify") parameters:@{@"code":form.code} resultClass:nil] continueWithBlock:^id(BFTask *task) {
            //update verify status
            if (task.result) {
                [SVProgressHUD showSuccessWithStatus:STR(@"验证成功")];
                self.navigationItem.rightBarButtonItem.enabled = YES;
            }
            else {
                [SVProgressHUD showErrorWithStatus:STR(@"验证失败")];
                self.navigationItem.rightBarButtonItem.enabled = NO;
            }
            return nil;
        }];
    }
}

- (void)onRightButtonPressed:(id)sender {

    [SVProgressHUD show];

    CUTERentContactForm *form = (CUTERentContactForm *)self.formController.form;
    CUTEUser *user = [CUTEUser new];
    user.nickname = form.name;
    user.email = form.email;
    user.country = form.country;
    user.phone = form.phone;
    CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
    Sequencer *sequencer = [Sequencer new];
    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/rent_ticket/", ticket.identifier, @"/edit") parameters:nil resultClass:nil] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                [SVProgressHUD showErrorWithError:task.error];
                return nil;
            } else {
                completion(task.result);
                [SVProgressHUD dismiss];
                return nil;
            }
        }];
    }];
    [sequencer run];
}

@end
