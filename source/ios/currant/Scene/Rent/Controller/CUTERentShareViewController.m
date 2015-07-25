//
//  CUTERentShareViewController.m
//  currant
//
//  Created by Foster Yin on 4/18/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentShareViewController.h"
#import "CUTECommonMacro.h"
#import "CUTEShareManager.h"
#import "CUTEConfiguration.h"
#import "MasonryMake.h"
#import <UIImageView+AFNetworking.h>
#import "CUTEConfiguration.h"
#import "NSString+Encoding.h"
#import "CUTEQrcodeCell.h"
#import "CUTEWebViewController.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTENotificationKey.h"
#import "CUTEAPIManager.h"
#import "CUTEUsageRecorder.h"
#import "ATConnect.h"
#import "CUTEApptentiveEvent.h"
#import "CUTERentShareForm.h"
#import "CUTETracker.h"
#import "UIBarButtonItem+ALActionBlocks.h"
#import "Aspects.h"
#import "CUTEUIMacro.h"

@interface CUTERentShareViewController ()

@end

@implementation CUTERentShareViewController

//- (CUTERentShareForm *)form {
//    return (CUTERentShareForm *)self.formController.form;
//}

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    self.navigationItem.title = STR(@"发布成功");

    self.navigationItem.leftBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"完成") style:UIBarButtonItemStylePlain block:^(id weakSender) {
        [self dismissViewControllerAnimated:YES completion:nil];
    }];
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"编辑") style:UIBarButtonItemStylePlain block:^(id weakSender) {
        [SVProgressHUD show];
        [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/rent_ticket/", self.ticket.identifier) parameters:nil resultClass:[CUTETicket class]] continueWithBlock:^id(BFTask *task) {
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
                if (task.result) {
                    [SVProgressHUD dismiss];
                    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_EDIT object:self userInfo:@{@"ticket": task.result}];
                }
                else {
                    [SVProgressHUD showErrorWithStatus:STR(@"获取失败")];
                }
            }

            return task;
        }];
    }];

    UIButton *shareButton = [UIButton buttonWithType:UIButtonTypeCustom];
    [shareButton setTitle:STR(@"分享") forState:UIControlStateNormal];
    [shareButton addTarget:self action:@selector(shareRentTicket) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:shareButton];
    shareButton.backgroundColor = [UIColor whiteColor];
    [shareButton setTitleColor:CUTE_MAIN_COLOR forState:UIControlStateNormal];
    MakeBegin(shareButton)
    MakeLeftEqualTo(self.view.left);
    MakeRighEqualTo(self.view.right);
    MakeBottomEqualTo(self.view.bottom);
    MakeHeightEqualTo(@(50));
    MakeEnd

    [self.view aspect_hookSelector:@selector(addSubview:) withOptions:AspectPositionAfter usingBlock:^(id<AspectInfo> info) {
        [self.view bringSubviewToFront:shareButton];
    } error:nil];

    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [self loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:CONCAT(@"/wechat-poster/", self.ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]]]];
        [self shareRentTicket];
    });
}

- (void)shareRentTicket {
    [[[CUTEShareManager sharedInstance] shareTicket:self.ticket viewController:self onButtonPressBlock:^(NSString * buttonName) {
        if ([buttonName isEqualToString:CUTEShareServiceWechatFriend]) {
            TrackScreen(@"share-to-wechat");
        }
        else if ([buttonName isEqualToString:CUTEShareServiceWechatCircle]) {
            TrackScreen(@"share-to-wechat");
        }
        else if ([buttonName isEqualToString:CUTEShareServiceSinaWeibo]) {
            TrackScreen(@"share-to-weibo");
        }
    }] continueWithBlock:^id(BFTask *task) {
        if (task.error) {
            [[CUTETracker sharedInstance] trackError:task.error];
            [SVProgressHUD showErrorWithError:task.error];
        }
        else if (task.exception) {
            [[CUTETracker sharedInstance] trackException:task.exception];
            [SVProgressHUD showErrorWithException:task.exception];
        }
        else if (task.isCancelled) {
            TrackScreen(GetScreenName(@"share-cancellation"));
            if (![[CUTEUsageRecorder sharedInstance] isApptentiveEventTriggered:APPTENTIVE_EVENT_SURVEY_AFTER_SHARE_CANCELLATION]) {
                if ([[ATConnect sharedConnection] engage:APPTENTIVE_EVENT_SURVEY_AFTER_SHARE_CANCELLATION fromViewController:self]) {
                    [[CUTEUsageRecorder sharedInstance] saveApptentiveEventTriggered:APPTENTIVE_EVENT_SURVEY_AFTER_SHARE_CANCELLATION];
                }
            }

        }
        else {

            if ([task.result isEqualToString:CUTEShareServiceWechatFriend]) {
                TrackEvent(KEventCategoryShare, kEventActionPress, @"wechat-friend", @(1));
            }
            else if ([task.result isEqualToString:CUTEShareServiceWechatCircle]) {
                TrackEvent(KEventCategoryShare, kEventActionPress, @"wechat-circle", @(1));
            }
            else if ([task.result isEqualToString:CUTEShareServiceSinaWeibo]) {
                TrackEvent(KEventCategoryShare, kEventActionPress, @"weibo", @(1));
            }

            TrackScreen(GetScreenName(@"share-success"));
            if (![[CUTEUsageRecorder sharedInstance] isApptentiveEventTriggered:APPTENTIVE_EVENT_SURVEY_AFTER_SHARE_SUCCESS]) {
                if ([[ATConnect sharedConnection] engage:APPTENTIVE_EVENT_SURVEY_AFTER_SHARE_SUCCESS fromViewController:self]) {
                    [[CUTEUsageRecorder sharedInstance] saveApptentiveEventTriggered:APPTENTIVE_EVENT_SURVEY_AFTER_SHARE_SUCCESS];
                }
            }
        }

        return task;
    } ];
}

//- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath  {
//    FXFormField *field = [self.formController fieldForIndexPath:indexPath];
//    if ([field.key isEqualToString:@"view"]) {
//        [cell setAccessoryType:UITableViewCellAccessoryDisclosureIndicator];
//    }
//    else if ([field.key isEqualToString:@"edit"]) {
//        [cell setAccessoryType:UITableViewCellAccessoryDisclosureIndicator];
//    }
//    else if ([field.key isEqualToString:@"qrcode"]) {
//        CUTEQrcodeCell *qrcodeCell = (CUTEQrcodeCell *)cell;
//        NSURL *originalURL = [NSURL URLWithString:CONCAT(@"/wechat-poster/", self.form.ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]];
//        NSString *content = [[originalURL absoluteString] URLEncode];
//        NSString *path = CONCAT(@"/qrcode/generate?content=", content);
//        NSURL *url = [NSURL URLWithString:path relativeToURL:[CUTEConfiguration hostURL]];
//        [qrcodeCell.qrcodeView setImageWithURL:[NSURL URLWithString:url.absoluteString]];
//    }
//}
//
//- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
//    FXFormField *field = [self.formController fieldForIndexPath:indexPath];
//    if ([field.key isEqualToString:@"view"]) {
//        CUTEWebViewController *controller = [[CUTEWebViewController alloc] init];
//        controller.url = [NSURL URLWithString:CONCAT(@"/wechat-poster/", self.form.ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]];
//        [controller loadRequest:[NSURLRequest requestWithURL:controller.url]];
//        [self.navigationController pushViewController:controller animated:YES];
//    }
//    if ([field.key isEqualToString:@"edit"]) {
//        [SVProgressHUD show];
//        [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/rent_ticket/", self.form.ticket.identifier) parameters:nil resultClass:[CUTETicket class]] continueWithBlock:^id(BFTask *task) {
//            if (task.error) {
//                [SVProgressHUD showErrorWithError:task.error];
//            }
//            else if (task.exception) {
//                [SVProgressHUD showErrorWithException:task.exception];
//            }
//            else if (task.isCancelled) {
//                [SVProgressHUD showErrorWithCancellation];
//            }
//            else {
//                if (task.result) {
//                    [SVProgressHUD dismiss];
//                    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_EDIT object:self userInfo:@{@"ticket": task.result}];
//                }
//                else {
//                    [SVProgressHUD showErrorWithStatus:STR(@"获取失败")];
//                }
//            }
//
//            return task;
//        }];
//    }
//    else if ([field.key isEqualToString:@"copyLink"]) {
//        [UIPasteboard generalPasteboard].string = [[NSURL URLWithString:CONCAT(@"/wechat-poster/", self.form.ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]] absoluteString];
//        [SVProgressHUD showSuccessWithStatus:STR(@"已复制至粘贴版")];
//    }
//    else if ([field.key isEqualToString:@"qrcode"]) {
//        [tableView deselectRowAtIndexPath:indexPath animated:NO];
//    }
//    else if ([field.key isEqualToString:@"wechat"]) {
//        [tableView deselectRowAtIndexPath:indexPath animated:YES];
//        [self shareRentTicket];
//    }
//
//}

//overrride with empty implementation, do not update barButtonItem
- (void)updateBackButton {

}

- (void)clearBackButton {

}

- (void)updateRightButtonWithURL:(NSURL *)url {

}


- (void)updateTitleWithURL:(NSURL *)url {
    self.navigationItem.title = STR(@"发布成功");
}


@end
