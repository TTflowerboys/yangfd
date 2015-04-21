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
    NSString *str = STR(@"为保证资料真实性，请先填写个人信息再验证手机号");
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

- (void)onVerificationButtonPressed:(id)sender {
    //TODO for phone existed user let him login

    if ([CUTEDataManager sharedInstance].user) {
        if (![self validateFormWithScenario:@"sendCode"]) {
            return;
        }
        [SVProgressHUD showWithStatus:STR(@"发送中...")];
        CUTEEnum *country = [[self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:1 inSection:0]] value];
        NSString *phone = [[self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:2 inSection:0]] value];
        [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/sms_verification/send" parameters:@{@"phone":phone, @"country":country.identifier} resultClass:nil] continueWithBlock:^id(BFTask *task) {
            if (task.result) {
                [SVProgressHUD showErrorWithError:task.error];
            }
            else {
                [SVProgressHUD showSuccessWithStatus:STR(@"发送成功")];
            }
            return nil;
        }];
    }
    else {
        if (![self validateFormWithScenario:@"register"]) {
            return;
        }
        [SVProgressHUD showWithStatus:STR(@"发送中...")];
        CUTERentContactForm *form = (CUTERentContactForm *)self.formController.form;
        CUTEUser *user = [CUTEUser new];
        user.nickname = form.name;
        user.email = form.email;
        user.country = form.country;
        user.phone = form.phone;
        [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/mobile-register" parameters:[user toParams] resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                [SVProgressHUD showErrorWithError:task.error];
                return nil;
            } else {
                [[CUTEDataManager sharedInstance] setUser:task.result];
                [SVProgressHUD showSuccessWithStatus:STR(@"发送成功")];
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


- (void)onRightButtonPressed:(id)sender {

    [SVProgressHUD showWithStatus:STR(@"发布中...")];

    CUTERentContactForm *form = (CUTERentContactForm *)self.formController.form;
    CUTEUser *user = [CUTEUser new];
    user.nickname = form.name;
    user.email = form.email;
    user.country = form.country;
    user.phone = form.phone;
    CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
    Sequencer *sequencer = [Sequencer new];
    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/rent_ticket/", ticket.identifier, @"/edit") parameters:
          @{@"status": kTicketStatusToRent} resultClass:nil] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                [SVProgressHUD showErrorWithError:task.error];
                return nil;
            } else {
                completion(task.result);
                [SVProgressHUD dismiss];
                [self shareToWechat];
//                [SVProgressHUD showSuccessWithStatus:STR(@"发布成功")];
//                [self.navigationController popToRootViewControllerAnimated:YES];
                return nil;
            }
        }];
    }];
    [sequencer run];
}

- (BaseReq *)makeWechatRequstWithScene:(NSInteger)scene title:(NSString *)title description:(NSString *)description url: (NSString *)url {
    WXMediaMessage *message = [WXMediaMessage message];
    message.title = title;
    message.description = description;
    [message setThumbImage:[UIImage imageNamed:@"AppIcon"]];
    WXWebpageObject *ext = [WXWebpageObject object];
    ext.webpageUrl = url;
    message.mediaObject = ext;
    SendMessageToWXReq* req = [[SendMessageToWXReq alloc] init];
    req.bText = NO;
    req.message = message;
    req.scene = scene;
    return req;
}

- (void)shareToWechat {
    [UIAlertView showWithTitle:STR(@"微信分享") message:nil cancelButtonTitle:STR(@"取消") otherButtonTitles:@[STR(@"分享给微信好友"), STR(@"分享到微信朋友圈")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {

        if([WXApi isWXAppInstalled] && buttonIndex != alertView.cancelButtonIndex){
            CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
            BaseReq *req = [self makeWechatRequstWithScene:buttonIndex == 1? WXSceneSession: WXSceneTimeline title:ticket.title description:ticket.ticketDescription url:[[NSURL URLWithString:CONCAT(@"/property-to-rent/", ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]] absoluteString]];

            [[CUTEWxManager sharedInstance] sendRequst:req onResponse:^(BaseResp *resp) {
                if ([resp isKindOfClass:[SendMessageToWXResp class]]) {
                    SendMessageToWXResp *backResp = (SendMessageToWXResp *)resp;
                    if (backResp.errCode == WXSuccess) {
                        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                            [SVProgressHUD showSuccessWithStatus:STR(@"分享成功")];
                        });

                    }
                    else if (backResp.errCode == WXErrCodeUserCancel) {
                        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                            [SVProgressHUD showErrorWithStatus:STR(@"分享取消")];
                        });
                    }
                    else {
                        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                            [SVProgressHUD showErrorWithStatus:STR(@"分享失败")];
                        });
                    }
                }
            }];
        }else{
            [SVProgressHUD showErrorWithStatus:STR(@"请安装微信")];
        }
        
        [self.navigationController popToRootViewControllerAnimated:NO];

        //TODO show
        CUTERentShareViewController *shareController = [CUTERentShareViewController new];
        UINavigationController *nc = [[UINavigationController alloc] initWithRootViewController:shareController];
        [[UIApplication sharedApplication].keyWindow.rootViewController presentViewController:nc animated:NO completion:nil];
    }];
}

@end
