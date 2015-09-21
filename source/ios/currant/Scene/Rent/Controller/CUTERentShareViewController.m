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
#import "currant-Swift.h"

@interface CUTERentShareViewController () 

@end

@implementation CUTERentShareViewController

//- (CUTERentShareForm *)form {
//    return (CUTERentShareForm *)self.formController.form;
//}

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    self.navigationItem.title = STR(@"RentShare/发布成功");

    self.navigationItem.leftBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"RentShare/完成") style:UIBarButtonItemStylePlain block:^(id weakSender) {
        [self dismissViewControllerAnimated:YES completion:nil];
    }];
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"RentShare/编辑") style:UIBarButtonItemStylePlain block:^(id weakSender) {
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
                    CUTETicket *ticket = task.result;
                    //[[CUTEDataManager sharedInstance] saveRentTicket:ticket];
                    [self.navigationController openRouteWithURL:[NSURL URLWithString:CONCAT(@"yangfd://property-to-rent/edit/", ticket.identifier)]];
                }
                else {
                    [SVProgressHUD showErrorWithStatus:STR(@"RentShare/获取失败")];
                }
            }

            return task;
        }];
    }];

    UIButton *shareButton = [UIButton buttonWithType:UIButtonTypeCustom];
    [shareButton setTitle:STR(@"RentShare/分享") forState:UIControlStateNormal];
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
        TrackScreen(@"press-to-share");

        if ([buttonName isEqualToString:CUTEShareServiceWechatFriend]) {
            TrackEvent(KEventCategoryShare, kEventActionPress, @"wechat-friend", @(1));
        }
        else if ([buttonName isEqualToString:CUTEShareServiceWechatCircle]) {
            TrackEvent(KEventCategoryShare, kEventActionPress, @"wechat-circle", @(1));
        }
        else if ([buttonName isEqualToString:CUTEShareServiceSinaWeibo]) {
            TrackEvent(KEventCategoryShare, kEventActionPress, @"weibo", @(1));
        }
        else if ([buttonName isEqualToString:CUTEShareServiceCopyLink]) {
            TrackEvent(KEventCategoryShare, kEventActionPress, @"copy-link", @(1));
            if (![[CUTEUsageRecorder sharedInstance] isApptentiveEventTriggered:APPTENTIVE_EVENT_SURVEY_AFTER_COPY_LINK]) {
                if ([[ATConnect sharedConnection] engage:APPTENTIVE_EVENT_SURVEY_AFTER_SHARE_CANCELLATION fromViewController:self]) {
                    [[CUTEUsageRecorder sharedInstance] saveApptentiveEventTriggered:APPTENTIVE_EVENT_SURVEY_AFTER_COPY_LINK];
                }
            }
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

//overrride with empty implementation, do not update barButtonItem
- (void)updateBackButton {

}

- (void)clearBackButton {

}

- (void)updateRightButtonWithURL:(NSURL *)url {

}


- (void)updateTitleWithURL:(NSURL *)url {
    self.navigationItem.title = STR(@"RentShare/发布成功");
}


@end
