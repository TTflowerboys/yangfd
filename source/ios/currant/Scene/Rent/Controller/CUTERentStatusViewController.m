//
//  CUTERentStatusViewController.m
//  currant
//
//  Created by Foster Yin on 3/4/16.
//  Copyright © 2016 BBTechgroup. All rights reserved.
//

#import "CUTERentStatusViewController.h"
#import <UIAlertView+Blocks.h>
#import <NSArray+ObjectiveSugar.h>
#import <TTTAttributedLabel.h>
#import "SVProgressHUD+CUTEAPI.h"
#import "NSURL+Assets.h"
#import <NSString+SLRESTfulCoreData.h>
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"
#import "MasonryMake.h"
#import "CUTENotificationKey.h"
#import "CUTERentTicketPublisher.h"
#import "CUTEDataManager.h"
#import "CUTEImageUploader.h"
#import "CUTERentStatusForm.h"





@interface CUTERentStatusViewController () <TTTAttributedLabelDelegate>

@end

@implementation CUTERentStatusViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    self.navigationItem.title = STR(@"PropertyInfo/房源状态");

    if ([self.form.ticket.status isEqualToString:kTicketStatusDraft]) {
        UILabel *hintLabel = [UILabel new];
        hintLabel.text = STR(@"RentStatus/您的房源当前处于草稿状态，如您不想继续发布，可以删除房源");
        hintLabel.textColor = HEXCOLOR(0x999999, 1);
        hintLabel.textAlignment = NSTextAlignmentCenter;
        hintLabel.font = [UIFont systemFontOfSize:12];
        hintLabel.numberOfLines = 0;
        [self.view addSubview:hintLabel];
        MakeBegin(hintLabel)
        MakeTopEqualTo(self.view).offset(80);
        MakeCenterXEqualTo(self.view);
        MakeWidthEqualTo(@(250));
        MakeHeightEqualTo(@(40));
        MakeEnd
    }

    //Delete button
    UIButton *deleteButton = [UIButton new];
    [deleteButton setTitle:STR(@"PropertyMoreInfo/删除房源") forState:UIControlStateNormal];
    [deleteButton addTarget:self action:@selector(delete) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:deleteButton];
    [deleteButton setTitleColor:CUTE_MAIN_COLOR forState:UIControlStateNormal];
    CGSize buttonTextSize = TextSizeOfLabel(deleteButton.titleLabel);
    MakeBegin(deleteButton)
    MakeWidthEqualTo(@(buttonTextSize.width + 40));
    MakeHeightEqualTo(@(buttonTextSize.height + 20));
    MakeCenterXEqualTo(self.view);
    MakeTopEqualTo(self.view).offset(390);
    MakeEnd

}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (CUTERentStatusForm *)form {
    return self.formController.form;
}


- (void)delete {
    UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:STR(@"RentPropertyMoreInfo/删除") message:nil delegate:nil cancelButtonTitle:STR(@"RentPropertyMoreInfo/确定") otherButtonTitles:STR(@"RentPropertyMoreInfo/取消"), nil];
    alertView.cancelButtonIndex = 1;
    alertView.tapBlock = ^(UIAlertView *alertView, NSInteger buttonIndex)  {
        if (buttonIndex != alertView.cancelButtonIndex) {

            [SVProgressHUD show];
            [[[CUTERentTicketPublisher sharedInstance] deleteTicket:self.form.ticket] continueWithBlock:^id(BFTask *task) {
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

                    [SVProgressHUD dismiss];
                    NSArray *images = [self.form.ticket.property realityImages];
                    [images each:^(NSString *object) {
                        if ([[NSURL URLWithString:object] isAssetURL]) {
                            [[CUTEImageUploader sharedInstance] cancelTaskForAssetURLString:object];
                        }
                    }];

                    [[CUTEDataManager sharedInstance] deleteTicket:self.form.ticket];
                    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_LIST_RELOAD object:self];
                    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                        [self.navigationController popToRootViewControllerAnimated:YES];
                    });
                }

                return task;
            }];
        }
    };
    [alertView show];
}

- (void)markRentTicketWithStatus:(NSString *)status {
    NSDictionary *statusHints = @{kTicketStatusDraft: STR(@"RentStatus/草稿"),
                                  kTicketStatusToRent: STR(@"RentStatus/发布中"),
                                  kTicketStatusRent: STR(@"RentStatus/已租出")
                                  };
    UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:CONCAT(STR(@"RentStatus/更新状态为："), statusHints[status]) message:nil delegate:nil cancelButtonTitle:STR(@"RentPropertyMoreInfo/确定") otherButtonTitles:STR(@"RentPropertyMoreInfo/取消"), nil];
    alertView.cancelButtonIndex = 1;
    alertView.tapBlock = ^(UIAlertView *alertView, NSInteger buttonIndex)  {
        if (buttonIndex != alertView.cancelButtonIndex) {

            [SVProgressHUD show];
            [[[CUTERentTicketPublisher sharedInstance] updateTicket:self.form.ticket withStatus:status] continueWithBlock:^id(BFTask *task) {
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

                    [SVProgressHUD dismiss];
                    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_LIST_RELOAD object:self];
                    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                        [self.navigationController popToRootViewControllerAnimated:YES];
                    });
                }

                return task;
            }];
        }
    };
    [alertView show];
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    FXFormField *field = [self.formController fieldForIndexPath:indexPath];
    NSString *status = self.form.ticket.status;
    NSDictionary *statusMap = @{kTicketStatusDraft: @"draft",
                                  kTicketStatusToRent: @"toRent",
                                  kTicketStatusRent: @"rent"
                                  };
    if ([statusMap[status] isEqualToString:field.key]) {
        cell.accessoryType = UITableViewCellAccessoryCheckmark;
    }
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    FXFormField *field = [self.formController fieldForIndexPath:indexPath];
    NSString *status = self.form.ticket.status;
    NSDictionary *statusMap = @{kTicketStatusDraft: @"draft",
                                kTicketStatusToRent: @"toRent",
                                kTicketStatusRent: @"rent"
                                };
    if ([statusMap[status] isEqualToString:field.key]) {
        [tableView deselectRowAtIndexPath:indexPath animated:YES];
    }
    else {
        if ([field.key isEqualToString:@"draft"]) {
            [self markRentTicketWithStatus:kTicketStatusDraft];
        }
        else if ([field.key isEqualToString:@"toRent"]) {
            [self markRentTicketWithStatus:kTicketStatusToRent];
        }
        else if ([field.key isEqualToString:@"rent"]) {
            [self markRentTicketWithStatus:kTicketStatusRent];
        }
    }
}

@end
