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
#import "CUTERentTicketPublisher.h"
#import <TTTAttributedLabel.h>
#import <NSArray+ObjectiveSugar.h>
#import "NSURL+CUTE.h"
#import "CUTERentLoginForm.h"
#import "CUTERentLoginViewController.h"
#import "CUTEAPICacheManager.h"
#import "MasonryMake.h"
#import "CUTETracker.h"
#import "CUTERentTypeListViewController.h"
#import "CUTERentMapEditViewController.h"
#import "CUTEUserDefaultKey.h"
#import "CUTEApplyBetaRentingForm.h"
#import <ALActionBlocks.h>
#import "CUTERentContactDisplaySettingForm.h"
#import "CUTERentContactDisplaySettingViewController.h"
#import "Sequencer.h"
#import "CUTEModelEditingListener.h"
#import "CUTEPhoneUtil.h"
//#import "currant-Swift.h"
#import <HHRouter.h>

@interface CUTERentContactViewController () <TTTAttributedLabelDelegate> {

    CUTEUser *_retUser;

    CUTERentContactDisplaySettingForm *_displaySettingForm;

    BOOL _userSaved;
}

@end


@implementation CUTERentContactViewController

-(BFTask *)setupRoute {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];

    if (self.params && [self.params[@"from_edit_ticket"] isEqualToString:@"true"]) {
        CUTETicket *ticket = [[CUTEDataManager sharedInstance] getRentTicketById:self.params[@"ticket_id"]];
        CUTEProperty *property = ticket.property;
        [[[CUTEAPICacheManager sharedInstance] getCountriesWithCountryCode:YES] continueWithBlock:^id(BFTask *task) {
            if (task.error) {
                [tcs setError:task.error];
            }
            else if (task.exception) {
                [tcs setException:task.exception];
            }
            else if (task.isCancelled) {
                [tcs cancel];
            }
            else {
                CUTERentContactForm *form = [CUTERentContactForm new];
                [form setAllCountries:task.result];
                //set default country same with the property
                if (property.country) {
                    form.country = [task.result find:^BOOL(CUTECountry *object) {
                        return [object.ISOcountryCode isEqualToString:property.country.ISOcountryCode];
                    }];
                }
                self.formController.form = form;
                self.ticket = ticket;
                [tcs setResult:nil];
            }

            return task;
        }];
    }

    return tcs.task;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"RentContact/联系方式");
    self.tableView.accessibilityIdentifier = STR(@"RentContact/用户信息");
}

- (void)viewWillDisappear:(BOOL)animated {
    // back button was pressed.  We know this is true because self is no longer
    // in the navigation stack.
    //http://stackoverflow.com/questions/14256051/uinavigationcontroller-and-back-button-action
    if ([self.navigationController.viewControllers indexOfObject:self] == NSNotFound) {
        //user created but not press publish
        //just revoke the session, if user don't want login
        if (_retUser && !_userSaved) {
            [[CUTEDataManager sharedInstance] clearAllCookies];
        }
    }

    [super viewWillDisappear:animated];
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

- (void)updateUserWithFormInfo:(CUTEUser *)user {
    CUTERentContactForm *form = (CUTERentContactForm *)self.formController.form;
    user.nickname = form.name;
    user.email = form.email;
    user.country = form.country;
    user.countryCode = form.country.countryCode;
    user.phone = form.phone;

    if (_displaySettingForm) {
        NSMutableArray *privateContactMethods = [NSMutableArray array];
        if (!_displaySettingForm.displayPhone) {
            [privateContactMethods addObject:@"phone"];
        }
        if (!_displaySettingForm.displayEmail) {
            [privateContactMethods addObject:@"email"];
        }
        if (IsNilNullOrEmpty(_displaySettingForm.wechat)) {
            [privateContactMethods addObject:@"wechat"];
        }
        else {
            user.wechat = _displaySettingForm.wechat;
        }
        if (IsArrayNilOrEmpty(privateContactMethods)) {
            user.privateContactMethods = nil;
        }
        else {
            user.privateContactMethods = privateContactMethods;
        }
    }
}

- (void)optionBack {
    [self.navigationController popViewControllerAnimated:YES];
}

- (void)onDisplaySettingPressed:(id)sender {
    if (!_displaySettingForm) {
        CUTERentContactDisplaySettingForm *form = [CUTERentContactDisplaySettingForm new];
        form.displayPhone = YES;
        form.displayEmail = YES;
        _displaySettingForm = form;
    }
    CUTERentContactDisplaySettingViewController *controller = [CUTERentContactDisplaySettingViewController new];
    controller.formController.form = _displaySettingForm;
    controller.navigationItem.title = STR(@"RentContact/设置联系方式展示");
    [self.navigationController pushViewController:controller animated:YES];
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


- (void)makeVerficationCodeTextFieldResignFirstResponder {

    FXFormField *field = [[self formController] fieldForKey:@"code"];
    NSIndexPath *indexPath = [[self formController] indexPathForField:field];
    UITableViewCell *cell = [self.tableView cellForRowAtIndexPath:indexPath];

    if ([cell isKindOfClass:[CUTEFormVerificationCodeCell class]]) {
        CUTEFormVerificationCodeCell *codeCell = (CUTEFormVerificationCodeCell *)cell;
        [codeCell.textField resignFirstResponder];
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

- (void)resetVerficationCodeCountDown {

    FXFormField *field = [[self formController] fieldForKey:@"code"];
    NSIndexPath *indexPath = [[self formController] indexPathForField:field];
    UITableViewCell *cell = [self.tableView cellForRowAtIndexPath:indexPath];

    if ([cell isKindOfClass:[CUTEFormVerificationCodeCell class]]) {
        CUTEFormVerificationCodeCell *codeCell = (CUTEFormVerificationCodeCell *)cell;
        [codeCell resetCountDown];
    }
}

- (void)setVerficationButtonEnable:(BOOL)enable {
    FXFormField *field = [[self formController] fieldForKey:@"code"];
    NSIndexPath *indexPath = [[self formController] indexPathForField:field];
    UITableViewCell *cell = [self.tableView cellForRowAtIndexPath:indexPath];

    if ([cell isKindOfClass:[CUTEFormVerificationCodeCell class]]) {
        CUTEFormVerificationCodeCell *codeCell = (CUTEFormVerificationCodeCell *)cell;
        [codeCell.verificationButton setEnabled:enable];
    }
}


- (void)onVerificationButtonPressed:(id)sender {

    if (![self validateFormWithScenario:@"fetchCode"]) {
        return;
    }

    CUTEUser *user = [CUTEUser new];
    [self updateUserWithFormInfo:user];
    [SVProgressHUD showWithStatus:STR(@"RentContact/获取中...")];
    [self setVerficationButtonEnable:NO];

    Sequencer *sequencer = [Sequencer new];
    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        if (_retUser) {
            completion(nil);
        }
        else {
            [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/check_exist" parameters:@{@"phone": CONCAT(@"+", NilNullToEmpty(user.countryCode.stringValue), NilNullToEmpty(user.phone))} resultClass:nil] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [self setVerficationButtonEnable:YES];
                    [SVProgressHUD showErrorWithError:task.error];
                }
                else {
                    if ([task.result boolValue]) {
                        [SVProgressHUD dismiss];
                        [self setVerficationButtonEnable:YES];
                        //remove keyboard overlay
                        //                    [self makeVerficationCodeTextFieldResignFirstResponder];
                        [UIAlertView showWithTitle:CONCAT(STR(@"RentContact/电话已被使用！请登录或者重置密码，如该用户不是您，请联系客服")) message:nil cancelButtonTitle:STR(@"RentContact/取消") otherButtonTitles:@[STR(@"RentContact/登录"), STR(@"RentContact/重置密码"), STR(@"RentContact/联系客服")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
                            NSString *buttonTitle = [alertView buttonTitleAtIndex:buttonIndex];
                            if ([buttonTitle isEqualToString:STR(@"RentContact/登录")]) {
                                [self login];
                            }
                            else if ([buttonTitle isEqualToString:STR(@"RentContact/重置密码")]) {
                                [UIAlertView showWithTitle:STR(@"RentContact/重置密码") message:nil cancelButtonTitle:STR(@"RentContact/取消") otherButtonTitles:@[STR(@"RentContact/通过短信"), STR(@"RentContact/通过邮箱")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
                                    if (buttonIndex == 1) {
                                        [self resetPasswordWithType:@"phone"];
                                    }
                                    else if (buttonIndex == 2) {
                                        [self resetPasswordWithType:@"email"];
                                    }
                                }];
                            }
                            else if ([buttonTitle isEqualToString:STR(@"RentContact/联系客服")]) {
                                [CUTEPhoneUtil showServicePhoneAlert];
                            }
                        }];
                    }
                    else {
                        [self makeVerficationCodeTextFieldBecomeFirstResponder];
                        completion(nil);
                    }
                }
                
                return nil;
            }];
        }
    }];
    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        if (_retUser) {
            [SVProgressHUD showWithStatus:STR(@"RentContact/发送中...")];
            [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/sms_verification/send" parameters:@{@"phone": CONCAT(@"+", NilNullToEmpty(user.countryCode.stringValue), NilNullToEmpty(user.phone))} resultClass:nil] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                    [self setVerficationButtonEnable:YES];
                }
                else {
                    [SVProgressHUD showSuccessWithStatus:STR(@"RentContact/发送成功")];
                    [self startVerficationCodeCountDown];
                }
                return nil;
            }];
        }
        else {
            //no user just creat one
            [SVProgressHUD showWithStatus:STR(@"RentContact/发送中...")];
            NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:user.toParams];
            
            [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/fast-register" parameters:params resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                    [self setVerficationButtonEnable:YES];
                    return nil;
                } else {
                    _retUser = task.result;
                    [SVProgressHUD dismiss];
                    [self startVerficationCodeCountDown];
                    [UIAlertView showWithTitle:STR(@"RentContact/已成功为您创建帐号，密码已发至您的邮箱。验证码发送成功，请验证手机号") message:nil cancelButtonTitle:STR(@"RentContact/确定") otherButtonTitles:nil tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {

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
    if (_retUser && !IsNilNullOrEmpty(form.code)) {
        [SVProgressHUD showWithStatus:STR(@"RentContact/验证中...")];
        [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/user/", _retUser.identifier, @"/sms_verification/verify") parameters:@{@"code":form.code} resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
            //update verify status
            if (task.result) {
                _retUser.phoneVerified = @(YES);
                [SVProgressHUD showSuccessWithStatus:STR(@"RentContact/验证成功")];
                [self resetVerficationCodeCountDown];
            }
            else {
                [SVProgressHUD showErrorWithStatus:STR(@"RentContact/验证失败")];
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

    if (_displaySettingForm) {
        NSError *error = [_displaySettingForm validateFormWithScenario:nil];
        if (error) {
            [SVProgressHUD showErrorWithError:error];
            return NO;
        }
    }

    if (!_retUser || !_retUser.phoneVerified.boolValue) {
        [SVProgressHUD showErrorWithStatus:STR(@"RentContact/手机未验证成功，请重发验证码")];
        return NO;
    }

    return YES;
}



- (void)submit {
    if (![self validate]) {
        return;
    }

    //CUTERentContactForm *form = (CUTERentContactForm *)self.formController.form;
    CUTEUser *user = _retUser;
    CUTEModelEditingListener *userListener = [CUTEModelEditingListener new];
    [userListener startListenMarkWithSayer:user];
    [self updateUserWithFormInfo:user];
    [userListener stopListenMark];

    Sequencer *sequencer = [Sequencer new];
    [SVProgressHUD showWithStatus:STR(@"RentContact/更新中...")];
    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        //user may update user info after create user in the send verification code process, like update private contact methods
        [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/edit" parameters:userListener.getEditedParams resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
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
                _retUser = task.result;
            }

            //no matter response ok or not just continue
            completion(_retUser);
            return task;
        }];
    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        CUTEUser *retUser = result;
        if (retUser) {
            [self saveUser:retUser];
        }


        if (self.params && [self.params[@"from_edit_ticket"] isEqualToString:@"true"]) {
            CUTETicket *ticket = self.ticket;

            [[[CUTERentTicketPublisher sharedInstance] publishTicket:ticket updateStatus:^(NSString *status) {
                [SVProgressHUD showWithStatus:status];
            }] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                    return nil;
                } else {
                    TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));

                    NSArray *screenNames = [[self.navigationController viewControllers] map:^id(UIViewController *object) {
                        if ([object isKindOfClass:[CUTEWebViewController class]]) {
                            return GetScreenName([(CUTEWebViewController *)object URL]);
                        }
                        return GetScreenName(object);
                    }];
                    //Notice: one only one ticket in publishing, so not calculate the duration base on different ticket
                    TrackScreensStayDuration(KEventCategoryPostRentTicket, screenNames);

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
    }];

    [sequencer run];
}

- (void)login {

    [[[CUTEAPICacheManager sharedInstance] getCountriesWithCountryCode:YES] continueWithBlock:^id(BFTask *task) {
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

            [form setAllCountries:task.result];
            //set default country same with the property
            if (self.ticket.property.country) {
                form.country = [task.result find:^BOOL(CUTECountry *object) {
                    return [object.ISOcountryCode isEqualToString:self.ticket.property.country.ISOcountryCode];
                }];
            }

            loginViewController.formController.form = form;
            [self.navigationController pushViewController:loginViewController animated:YES];
        }

        return task;
    }];
}


- (void)resetPasswordWithType:(NSString *)type {

    [[[CUTEAPICacheManager sharedInstance] getCountriesWithCountryCode:YES] continueWithBlock:^id(BFTask *task) {
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
            [form setAllCountries:task.result];
            //set default country same with the property
            if (self.ticket.property.country) {
                form.country = [task.result find:^BOOL(CUTECountry *object) {
                    return [object.ISOcountryCode isEqualToString:self.ticket.property.country.ISOcountryCode];
                }];
            }

            loginViewController.formController.form = form;
            [self.navigationController pushViewController:loginViewController animated:YES];
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                if ([type isEqualToString:@"phone"]) {
                    [loginViewController resetPassword];
                }
                else if ([type isEqualToString:@"email"]) {
                    [loginViewController resetPasswordWithEmail];
                }
            });
        }

        return task;
    }];
}

- (void)saveUser:(CUTEUser *)user {
    [NotificationCenter postNotificationName:KNOTIF_USER_DID_LOGIN object:self userInfo:@{@"user": user}];
    [NotificationCenter postNotificationName:KNOTIF_USER_VERIFY_PHONE object:self userInfo:@{@"user": user, @"whileEditingTicket": self.ticket? @(YES): @(NO)}];
    [NotificationCenter postNotificationName:KNOTIF_MARK_USER_AS_LANDLORD object:self userInfo:@{@"user": user}];
    _userSaved = YES;
}

@end
