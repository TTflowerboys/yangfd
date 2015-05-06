//
//  CUTERentContactViewController.m
//  currant
//
//  Created by Foster Yin on 4/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentContactViewController.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"
#import "CUTEFormVerificationCodeCell.h"
#import "CUTEAPIManager.h"
#import "CUTEEnum.h"
#import "CUTEUser.h"
#import "CUTERentContactForm.h"
#import <Sequencer.h>
#import "CUTEDataManager.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "FXFormViewController+CUTEForm.h"
#import "CUTERentShareViewController.h"
#import "WxApi.h"
#import "CUTEWxManager.h"
#import "CUTEConfiguration.h"
#import <UIAlertView+Blocks.h>
#import "CUTENotificationKey.h"
#import "CUTERentTickePublisher.h"
#import <TTTAttributedLabel.h>
#import "NSURL+CUTE.h"
#import "CUTERentLoginForm.h"
#import "CUTERentLoginViewController.h"
#import "CUTEEnumManager.h"

@interface CUTERentContactViewController () <TTTAttributedLabelDelegate> {

    BOOL _userVerified;
}

@end


@implementation CUTERentContactViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"联系方式");

    TTTAttributedLabel *headerLabel = [[TTTAttributedLabel alloc] init];
    NSString *str = STR(@"为保证资料真实性，请先填写个人信息再验证手机号。已经有帐号？请登录");
    NSMutableAttributedString* attrString = [[NSMutableAttributedString alloc] initWithString:str attributes:@{NSForegroundColorAttributeName: HEXCOLOR(0x999999, 1.0)}];
    NSMutableParagraphStyle *style = [[NSMutableParagraphStyle alloc] init];
    [style setLineSpacing:8];
    [attrString addAttribute:NSParagraphStyleAttributeName
                       value:style
                       range:NSMakeRange(0, str.length)];
    headerLabel.attributedText = attrString;
    headerLabel.font = [UIFont systemFontOfSize:12];
    NSRange range = [headerLabel.text rangeOfString:STR(@"登录")];
    [headerLabel addLinkToURL:[NSURL YangfdURLWithString:@"/login"] withRange:range];
//    headerLabel.linkAttributes = @{NSForegroundColorAttributeName: CUTE_MAIN_COLOR};

    headerLabel.numberOfLines = 0;
    headerLabel.frame = CGRectMake(RectWidthExclude(self.view.bounds, 240) / 2, 0, 240, 80);
    UIView *headerView = [UIView new];
    headerView.frame = CGRectMake(0, 0, ScreenWidth, 80);
    [headerView addSubview:headerLabel];

    headerLabel.delegate = self;
    self.tableView.tableHeaderView = headerView;

//    UILabel * label = [UILabel new];
//    NSString *str = STR(@"为保证资料真实性，请先填写个人信息再验证手机号");
//    NSMutableAttributedString* attrString = [[NSMutableAttributedString alloc] initWithString:str attributes:@{NSForegroundColorAttributeName: HEXCOLOR(0x999999, 1.0)}];
//    NSMutableParagraphStyle *style = [[NSMutableParagraphStyle alloc] init];
//    [style setLineSpacing:8];
//    [attrString addAttribute:NSParagraphStyleAttributeName
//                       value:style
//                       range:NSMakeRange(0, str.length)];
//    label.attributedText = attrString;
//    label.font = [UIFont systemFontOfSize:12];
//    label.numberOfLines = 0;
//    label.textAlignment = NSTextAlignmentCenter;
//    label.frame = CGRectMake(RectWidthExclude(self.view.bounds, 240) / 2, 20, 240, 60);
//    UIView *footerView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, ScreenWidth, 100)];
//    [footerView addSubview:label];
//    self.tableView.tableFooterView = footerView;
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    if ([cell isKindOfClass:[CUTEFormVerificationCodeCell class]]) {
        CUTEFormVerificationCodeCell *codeCell = (CUTEFormVerificationCodeCell *)cell;
        [codeCell.verificationButton addTarget:self action:@selector(onVerificationButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
    }
}

- (void)onVerificationButtonPressed:(id)sender {
    if (![self validateFormWithScenario:@"register"]) {
        return;
    }
    CUTERentContactForm *form = (CUTERentContactForm *)self.formController.form;
    CUTEUser *user = [CUTEUser new];
    user.nickname = form.name;
    user.email = form.email;
    user.country = form.country;
    user.phone = form.phone;


    Sequencer *sequencer = [Sequencer new];
    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/check_exist" parameters:@{@"country":user.country.identifier, @"phone": user.phone} resultClass:nil] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                [SVProgressHUD showErrorWithError:task.error];
            }
            else {
                if ([task.result boolValue]) {
                    [[[UIAlertView alloc] initWithTitle:STR(@"用户已存在，请登录或者修改密码") message:nil delegate:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil] show];
                }
                else {
                    completion(nil);
                }
            }
            
            return nil;
        }];
    }];
    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        if ([CUTEDataManager sharedInstance].isUserLoggedIn) {
            [SVProgressHUD showWithStatus:STR(@"发送中...")];
            CUTEEnum *country = [[self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:1 inSection:0]] value];
            NSString *phone = [[self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:2 inSection:0]] value];
            [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/sms_verification/send" parameters:@{@"phone":phone, @"country":country.identifier} resultClass:nil] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                }
                else {
                    [SVProgressHUD showSuccessWithStatus:STR(@"发送成功")];
                }
                return nil;
            }];
        }
        else {

            [SVProgressHUD showWithStatus:STR(@"发送中...")];
            [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/fast-register" parameters:[user toParams] resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                    return nil;
                } else {
                    [[CUTEDataManager sharedInstance] setUser:task.result];
                    [[CUTEDataManager sharedInstance] saveAllCookies];
                    [SVProgressHUD showSuccessWithStatus:STR(@"发送成功")];
                    return nil;
                }
            }];
        }
    }];

    [sequencer run];
}

- (void)codeFieldEndEdit {
    CUTERentContactForm *form = (CUTERentContactForm *)self.formController.form;
    //after create can validate the code
    if ([CUTEDataManager sharedInstance].isUserLoggedIn) {
        [SVProgressHUD showWithStatus:STR(@"验证中...")];
        [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/user/", [CUTEDataManager sharedInstance].user.identifier, @"/sms_verification/verify") parameters:@{@"code":form.code} resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
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


- (void)submit {

    [SVProgressHUD showWithStatus:STR(@"发布中...")];

    CUTERentContactForm *form = (CUTERentContactForm *)self.formController.form;
    CUTEUser *user = [CUTEUser new];
    user.nickname = form.name;
    user.email = form.email;
    user.country = form.country;
    user.phone = form.phone;
    CUTETicket *ticket = self.ticket;

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
}

#pragma mark - TTTAttributedLabelDelegate

- (void)attributedLabel:(TTTAttributedLabel *)label
   didSelectLinkWithURL:(NSURL *)url {
    if ([url isYangfdURL]) {
        if ([url.path isEqualToString:@"/login"]) {
            [[[CUTEEnumManager sharedInstance] getEnumsByType:@"country"] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                    return nil;
                } else {
                    CUTERentLoginViewController *loginViewController = [CUTERentLoginViewController new];
                    loginViewController.ticket = self.ticket;
                    CUTERentLoginForm *form = [CUTERentLoginForm new];
                    [form setAllCountries:task.result];
                    //set default country same with the property
                    form.country = self.ticket.property.country;
                    loginViewController.formController.form = form;
                    [self.navigationController pushViewController:loginViewController animated:YES];
                    return nil;
                }
            }];
        }
    }
}

@end
