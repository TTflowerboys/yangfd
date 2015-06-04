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
#import "CUTEFormCenterTextCell.h"
#import "CUTEAPIManager.h"
#import "CUTEEnum.h"
#import "CUTEUser.h"
#import "CUTERentContactForm.h"
#import <Sequencer.h>
#import "CUTEDataManager.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTERentShareViewController.h"
#import "WxApi.h"
#import "CUTEShareManager.h"
#import "CUTEConfiguration.h"
#import <UIAlertView+Blocks.h>
#import "CUTENotificationKey.h"
#import "CUTERentTickePublisher.h"
#import <TTTAttributedLabel.h>
#import <NSArray+ObjectiveSugar.h>
#import "NSURL+CUTE.h"
#import "CUTERentLoginForm.h"
#import "CUTERentLoginViewController.h"
#import "CUTEEnumManager.h"
#import "MasonryMake.h"
#import "CUTETracker.h"
#import "CUTERentTypeListViewController.h"
#import "CUTERentAddressMapViewController.h"
#import "CUTERentPropertyInfoViewController.h"
#import "CUTERentTicketPreviewViewController.h"
#import "CUTEUserDefaultKey.h"
#import "CUTEApplyBetaRentingViewController.h"
#import "CUTEApplyBetaRentingForm.h"

@interface CUTERentContactViewController () <TTTAttributedLabelDelegate> {

    BOOL _userVerified;

    CUTEUser *_user;
}

@end


@implementation CUTERentContactViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    if (![[NSUserDefaults standardUserDefaults] boolForKey:CUTE_USER_DEFAULT_BETA_USER_REGISTERED]) {
        self.navigationItem.title = STR(@"用户注册");
    }
    else {
        self.navigationItem.title = STR(@"联系方式");
    }
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    if ([cell isKindOfClass:[CUTEFormVerificationCodeCell class]]) {
        CUTEFormVerificationCodeCell *codeCell = (CUTEFormVerificationCodeCell *)cell;
        [codeCell.verificationButton addTarget:self action:@selector(onVerificationButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
    }
    else if ([cell isKindOfClass:[CUTEFormCenterTextCell class]]) {
        CUTEFormCenterTextCell *textCell = (CUTEFormCenterTextCell *)cell;
        textCell.textColor = CUTE_MAIN_COLOR;
    }
}



- (UIView *)tableView:(UITableView *)tableView viewForFooterInSection:(NSInteger)section
{
    NSString *footer = [[[self.formController sectionAtIndex:section] valueForKey:@"footer"] description];
    if (!IsNilNullOrEmpty(footer)) {
        UILabel * label = [UILabel new];
        NSString *str = footer;
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

        UIView *view = [UIView new];
        [view addSubview:label];

        MakeBegin(label)
        MakeTopEqualTo(view.top).offset(15);
        MakeLeftEqualTo(view.left).offset(40);
        MakeRighEqualTo(view.right).offset(-40);
        MakeBottomEqualTo(view.bottom).offset(-8);
        MakeEnd

        return view;

    }
    return nil;

}

- (CGFloat)tableView:(UITableView *)tableView heightForFooterInSection:(NSInteger)section {
    NSString *footer = [[[self.formController sectionAtIndex:section] valueForKey:@"footer"] description];
    return IsNilNullOrEmpty(footer)? 0 : 70;
}

- (void)optionBack {
    [self.navigationController popViewControllerAnimated:YES];
}

- (void)onVerificationButtonPressed:(id)sender {
    if (![self validateFormWithScenario:@"fetchCode"]) {
        return;
    }
    CUTERentContactForm *form = (CUTERentContactForm *)self.formController.form;
    CUTEUser *user = [CUTEUser new];
    user.nickname = form.name;
    user.email = form.email;
    user.country = form.country;
    user.phone = form.phone;

    [SVProgressHUD showWithStatus:STR(@"获取中...")];
    Sequencer *sequencer = [Sequencer new];
    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/check_exist" parameters:@{@"country":user.country.code, @"phone": user.phone} resultClass:nil] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                [SVProgressHUD showErrorWithError:task.error];
            }
            else {
                if ([task.result boolValue]) {
                    [SVProgressHUD dismiss];
                    [[[UIAlertView alloc] initWithTitle:CONCAT(STR(@"电话已被使用！请登录或者修改密码，如该用户不是您，请联系洋房东"), @" ", [CUTEConfiguration servicePhone]) message:nil delegate:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil] show];
                }
                else {
                    completion(nil);
                }
            }

            return nil;
        }];
    }];
    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        if (_user) {
            [SVProgressHUD showWithStatus:STR(@"发送中...")];
            [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/sms_verification/send" parameters:@{@"phone":user.phone, @"country":user.country.code} resultClass:nil] continueWithBlock:^id(BFTask *task) {
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
            //no user just creat one
            [SVProgressHUD showWithStatus:STR(@"发送中...")];
            NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:user.toParams];
            if (!IsNilNullOrEmpty(form.invitationCode)) {
                [params setObject:form.invitationCode forKey:@"invitation_code"];
            }
            [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/fast-register" parameters:params resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                    return nil;
                } else {
                    _user = task.result;
                    [SVProgressHUD dismiss];
                    [UIAlertView showWithTitle:STR(@"已成功为您创建帐号，密码已发至您的邮箱。验证码发送成功，请验证手机号") message:nil cancelButtonTitle:STR(@"确定") otherButtonTitles:nil tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {

                    }];
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
    if (_user) {
        [SVProgressHUD showWithStatus:STR(@"验证中...")];
        [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/user/", _user.identifier, @"/sms_verification/verify") parameters:@{@"code":form.code} resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
            //update verify status
            if (task.result) {
                _userVerified = YES;
                [SVProgressHUD showSuccessWithStatus:STR(@"验证成功")];
            }
            else {
                [SVProgressHUD showErrorWithStatus:STR(@"验证失败")];
            }
            return nil;
        }];
    }
}

- (BOOL)validate {
    BOOL formValidation = [self validateFormWithScenario:@"submit"];
    if (!formValidation) {
        return NO;
    }
    if (!_user || !_userVerified) {
        [SVProgressHUD showErrorWithStatus:STR(@"手机未验证成功，请重发验证码")];
        return NO;
    }

    return YES;
}



- (void)submit {

    if (![self validate]) {
        return;
    }

    CUTERentContactForm *form = (CUTERentContactForm *)self.formController.form;
    CUTEUser *user = _user;

    if (form.isOnlyRegister) {
        if ([user hasRole:kUserRoleBetaRenting]) {
            [[CUTEDataManager sharedInstance] saveUser:user];
            [[CUTEDataManager sharedInstance] saveAllCookies];
            [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_USER_DID_LOGIN object:self];

            [[NSUserDefaults standardUserDefaults] setBool:YES forKey:CUTE_USER_DEFAULT_BETA_USER_REGISTERED];
            [[NSUserDefaults standardUserDefaults] synchronize];
            [self dismissViewControllerAnimated:YES completion:^{

            }];
        }
        else {
            [SVProgressHUD showSuccessWithStatus:STR(@"您已注册成功，请申请测试邀请码。")];
            CUTEApplyBetaRentingViewController *controller = [CUTEApplyBetaRentingViewController new];
            controller.formController.form = [CUTEApplyBetaRentingForm new];
            [self.navigationController pushViewController:controller animated:YES];
        }
    }
    else {
        [[CUTEDataManager sharedInstance] saveUser:user];
        [[CUTEDataManager sharedInstance] saveAllCookies];
        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_USER_DID_LOGIN object:self];

        [SVProgressHUD showWithStatus:STR(@"发布中...")];

        CUTEUser *user = [CUTEUser new];
        user.nickname = form.name;
        user.email = form.email;
        user.country = form.country;
        user.phone = form.phone;
        CUTETicket *ticket = self.ticket;

        [[[CUTERentTickePublisher sharedInstance] publishTicket:ticket updateStatus:^(NSString *status) {
            [SVProgressHUD showWithStatus:status];
        }] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                [SVProgressHUD showErrorWithError:task.error];
                return nil;
            } else {
                TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));

                NSArray *screeNames = @[GetScreenNameFromClass([CUTERentTypeListViewController class]),
                                        GetScreenNameFromClass([CUTERentAddressMapViewController class]),
                                        GetScreenNameFromClass([CUTERentPropertyInfoViewController class]),
                                        GetScreenNameFromClass([CUTERentTicketPreviewViewController class]),
                                        GetScreenNameFromClass([CUTERentContactViewController class])];
                TrackScreensStayDuration(KEventCategoryPostRentTicket, screeNames);

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
}


- (void)login {

    [[[CUTEEnumManager sharedInstance] getCountriesWithCountryCode:YES] continueWithBlock:^id(BFTask *task) {
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
            TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));
            CUTERentLoginViewController *loginViewController = [CUTERentLoginViewController new];
            loginViewController.ticket = self.ticket;
            CUTERentLoginForm *form = [CUTERentLoginForm new];
            form.isOnlyRegister = ((CUTERentContactForm *)self.formController.form).isOnlyRegister;
            [form setAllCountries:task.result];
            //set default country same with the property
            if (self.ticket.property.country) {
                form.country = [task.result find:^BOOL(CUTECountry *object) {
                    return [object.code isEqualToString:self.ticket.property.country.code];
                }];
            }

            loginViewController.formController.form = form;
            [self.navigationController pushViewController:loginViewController animated:YES];
        }

        return task;
    }];
}

@end
