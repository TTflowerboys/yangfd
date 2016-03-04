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
#import "SVProgressHUD+CUTEAPI.h"
#import "NSURL+Assets.h"
#import "CUTECommonMacro.h"
#import "CUTENotificationKey.h"
#import "CUTERentTicketPublisher.h"
#import "CUTEDataManager.h"
#import "CUTEImageUploader.h"
#import "CUTERentStatusForm.h"



@interface CUTERentStatusViewController ()

@end

@implementation CUTERentStatusViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    self.navigationItem.title = STR(@"PropertyInfo/房源状态");
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

- (void)markRentTicketDraft {
    UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:STR(@"RentStatus/下架") message:nil delegate:nil cancelButtonTitle:STR(@"RentPropertyMoreInfo/确定") otherButtonTitles:STR(@"RentPropertyMoreInfo/取消"), nil];
    alertView.cancelButtonIndex = 1;
    alertView.tapBlock = ^(UIAlertView *alertView, NSInteger buttonIndex)  {
        if (buttonIndex != alertView.cancelButtonIndex) {

            [SVProgressHUD show];
            [[[CUTERentTicketPublisher sharedInstance] updateTicket:self.form.ticket withStatus:kTicketStatusDraft] continueWithBlock:^id(BFTask *task) {
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
                        [self.navigationController popViewControllerAnimated:YES];
                    });
                }

                return task;
            }];
        }
    };
    [alertView show];
}

- (void)markRentTicketRent {
    UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:STR(@"RentStatus/已出租") message:nil delegate:nil cancelButtonTitle:STR(@"RentPropertyMoreInfo/确定") otherButtonTitles:STR(@"RentPropertyMoreInfo/取消"), nil];
    alertView.cancelButtonIndex = 1;
    alertView.tapBlock = ^(UIAlertView *alertView, NSInteger buttonIndex)  {
        if (buttonIndex != alertView.cancelButtonIndex) {

            [SVProgressHUD show];
            [[[CUTERentTicketPublisher sharedInstance] updateTicket:self.form.ticket withStatus:kTicketStatusRent] continueWithBlock:^id(BFTask *task) {
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
                        [self.navigationController popViewControllerAnimated:YES];
                    });
                }

                return task;
            }];
        }
    };
    [alertView show];
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    FXFormField *field = [self.formController fieldForIndexPath:indexPath];
    if ([field.key isEqualToString:@"draft"]) {
        [self markRentTicketDraft];
    }
    else if ([field.key isEqualToString:@"rent"]) {
        [self markRentTicketRent];
    }
}

@end
