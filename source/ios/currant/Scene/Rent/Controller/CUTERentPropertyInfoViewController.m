//
//  CUTEPropertyInfoViewController.m
//  currant
//
//  Created by Foster Yin on 4/8/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPropertyInfoViewController.h"
#import "CUTERentContactViewController.h"
#import "CUTERentContactForm.h"
#import "CUTEDataManager.h"
#import <Bolts/Bolts.h>
#import "CUTEProperty.h"
#import <UIKit/UIKit.h>
#import <BBTRestClient.h>
#import "CUTEConfiguration.h"
#import <BBTJSON.h>
#import <NSArray+ObjectiveSugar.h>
#import <UIAlertView+Blocks.h>
#import "CUTEEnumManager.h"
#import "CUTECommonMacro.h"
#import "CUTERentPriceViewController.h"
#import "CUTERentPriceForm.h"
#import "CUTEAreaForm.h"
#import "CUTEPropertyInfoForm.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEFormImagePickerCell.h"
#import "CUTERentPropertyMoreInfoViewController.h"
#import "CUTERentAreaViewController.h"
#import "CUTEUnfinishedRentTicketListViewController.h"
#import "CUTERentTypeListViewController.h"
#import "CUTERentTypeListForm.h"
#import "CUTERentAddressMapViewController.h"
#import "CUTENotificationKey.h"
#import "CUTERentTicketPublisher.h"
#import "CUTERentAddressEditViewController.h"
#import "CUTERentAddressEditForm.h"
#import "CUTENavigationUtil.h"
#import "CUTERentTicketPreviewViewController.h"
#import "CUTETracker.h"
#import "Sequencer.h"
#import <NSDate-Extensions/NSDate-Utilities.h>
#import "CUTERentPeriodViewController.h"

@interface CUTERentPropertyInfoViewController () {

    CUTERentAreaViewController *_editAreaViewController;

    CUTERentPriceViewController *_editRentPriceViewController;

    CUTERentPeriodViewController *_editRentPeriodViewController;
}

@end


@implementation CUTERentPropertyInfoViewController

- (instancetype)init
{
    self = [super init];
    if (self) {
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"房产信息");

    self.navigationItem.leftBarButtonItem = [CUTENavigationUtil backBarButtonItemWithTarget:self action:@selector(onLeftButtonPressed:)];

    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"预览") style:UIBarButtonItemStylePlain target:self action:@selector(onPreviewButtonPressed:)];
    self.tableView.accessibilityLabel = STR(@"房产信息表单");
    self.tableView.accessibilityIdentifier = self.tableView.accessibilityLabel;
}

- (CUTEPropertyInfoForm *)form {
    return (CUTEPropertyInfoForm *)self.formController.form;
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    FXFormField *field = [self.formController fieldForIndexPath:indexPath];
    if ([field.key isEqualToString:@"photos"]) {
        CUTEFormImagePickerCell *pickerCell = (CUTEFormImagePickerCell *)cell;
        CUTETicketForm *form = [CUTETicketForm new];
        pickerCell.form = form;
        pickerCell.form.ticket = self.form.ticket;
        [pickerCell update];
    }
    else if ([field.key isEqualToString:@"rentPrice"]) {
        if (self.form.ticket.price) {
            cell.detailTextLabel.text = CONCAT([CUTECurrency symbolOfCurrencyUnit:self.form.ticket.price.unit], [NSString stringWithFormat:@"%.2lf", self.form.ticket.price.value], @"/", STR(@"周"));
        }
    }
    else if ([field.key isEqualToString:@"rentPeriod"]) {

        if (!IsNilOrNull(self.form.ticket.rentAvailableTime)) {
            NSDateFormatter *formatter = [NSDateFormatter new];
            formatter.dateStyle = NSDateFormatterMediumStyle;
            formatter.timeStyle = NSDateFormatterNoStyle;
            cell.detailTextLabel.text = CONCAT([formatter stringFromDate:[NSDate dateWithTimeIntervalSince1970:self.form.ticket.rentAvailableTime.doubleValue]], STR(@"起"));
        }
        else if (!IsNilOrNull(self.form.ticket.rentDeadlineTime)) {
            NSDateFormatter *formatter = [NSDateFormatter new];
            formatter.dateStyle = NSDateFormatterMediumStyle;
            formatter.timeStyle = NSDateFormatterNoStyle;
            cell.detailTextLabel.text = CONCAT([formatter stringFromDate:[NSDate dateWithTimeIntervalSince1970:self.form.ticket.rentDeadlineTime.doubleValue]], STR(@"起"));
        }
    }
    else if ([field.key isEqualToString:@"area"]) {
        if (self.form.ticket.rentType) {
            if ([self.form.ticket.rentType.slug hasSuffix:@":whole"]) {
                cell.textLabel.text = STR(@"房屋面积（选填）");
            }
            else {
                cell.textLabel.text = STR(@"房间面积（选填）");
            }
        }

        if (self.form.ticket.space) {
            cell.detailTextLabel.text = [NSString stringWithFormat:@"%.2f %@", self.form.ticket.space.value, self.form.ticket.space.unitSymbol];
        }
    }
    else if ([field.key isEqualToString:@"rentType"]) {
        if (self.form.ticket.rentType) {
            cell.detailTextLabel.text = self.form.ticket.rentType.value;
        }
    }
    else if ([field.key isEqualToString:@"address"]) {
        if (self.form.ticket.property) {
            cell.detailTextLabel.text = self.form.ticket.property.address;
        }
    }
}

- (void)onLeftButtonPressed:(id)sender {

    if ([self.form.ticket.status isEqual:kTicketStatusDraft]) {
        UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:STR(@"您确定放弃发布吗？放弃后系统将会将您已填写的信息保存为草稿") message:nil delegate:nil cancelButtonTitle:STR(@"放弃") otherButtonTitles:STR(@"取消"), nil];
        alertView.cancelButtonIndex = 1;
        alertView.tapBlock = ^(UIAlertView *alertView, NSInteger buttonIndex)  {
            if (buttonIndex != alertView.cancelButtonIndex) {
                [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_LIST_RELOAD object:self];
                dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                    [self.navigationController popToRootViewControllerAnimated:YES];
                });
            }
        };
        [alertView show];

    }
    else {
        [self.navigationController popViewControllerAnimated:YES];
    }
}

- (void)onPreviewButtonPressed:(id)sender {
    [self submit];
}

- (void)editLandlordType {
    CUTEPropertyInfoForm *form = (CUTEPropertyInfoForm *)self.formController.form;
    [self.navigationController popViewControllerAnimated:YES];
    [form syncTicketWithUpdateInfo:@{@"landlordType": form.landlordType}];
}

- (void)editPropertyType {
    CUTEPropertyInfoForm *form = (CUTEPropertyInfoForm *)self.formController.form;
    [self.navigationController popViewControllerAnimated:YES];
    [form syncTicketWithUpdateInfo:@{@"property.propertyType": form.propertyType}];
}

- (void)editRooms:(id)sender {
    CUTEPropertyInfoForm *form = (CUTEPropertyInfoForm *)self.formController.form;

    [form syncTicketWithUpdateInfo:@{@"property.bedroomCount": @(form.bedroomCount),
       @"property.livingroomCount": @(form.livingroomCount),
         @"property.bathroomCount": @(form.bathroomCount),
          }];
}

- (void)editArea {
    if (!_editAreaViewController) {
        CUTERentAreaViewController *controller = [CUTERentAreaViewController new];
        CUTEAreaForm *form = [CUTEAreaForm new];
        form.ticket = self.form.ticket;
        form.area = self.form.ticket.space.value;
        controller.formController.form = form;
        _editAreaViewController = controller;

        __weak typeof(self)weakSelf = self;
        _editAreaViewController.updateRentAreaCompletion = ^ {
            [weakSelf.formController enumerateFieldsWithBlock:^(FXFormField *field, NSIndexPath *indexPath) {
                if ([field.key isEqualToString:@"area"]) {
                    [[weakSelf tableView] reloadRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationNone];
                }
            }];
        };

    }

    //in case of push twice time
    if (self.navigationController.topViewController != _editAreaViewController) {
        [self.navigationController pushViewController:_editAreaViewController animated:YES];
    }
}

- (void)editRentPrice {

    if (!_editRentPriceViewController) {

        CUTETicket *ticket = self.form.ticket;
        CUTERentPriceViewController *controller = [[CUTERentPriceViewController alloc] init];
        CUTERentPriceForm *form = [CUTERentPriceForm new];
        form.ticket = self.form.ticket;
        form.currency = ticket.price.unit;
        form.rentPrice = ticket.price.value;
        form.deposit = ticket.deposit? @(ticket.deposit.value): nil;
        form.billCovered = ticket.billCovered? ticket.billCovered.boolValue: NO;
        controller.formController.form = form;
        controller.navigationItem.title = STR(@"租金");
        _editRentPriceViewController = controller;

        __weak typeof(self)weakSelf = self;
        _editRentPriceViewController.updatePriceCompletion = ^ {
            [weakSelf.formController enumerateFieldsWithBlock:^(FXFormField *field, NSIndexPath *indexPath) {
                if ([field.key isEqualToString:@"rentPrice"]) {
                    [[weakSelf tableView] reloadRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationNone];
                }
            }];
        };
    }


    //in case of push twice time
    if (self.navigationController.topViewController != _editRentPriceViewController) {
        [self.navigationController pushViewController:_editRentPriceViewController animated:YES];
    }
}

- (void)editRentPeriod {
    if (!_editRentPeriodViewController) {
        CUTETicket *ticket = self.form.ticket;
        if (!ticket.rentAvailableTime) {
            ticket.rentAvailableTime = @([[NSDate date] timeIntervalSince1970]);
        }
        if (!ticket.minimumRentPeriod) {
            ticket.minimumRentPeriod = [CUTETimePeriod timePeriodWithValue:1 unit:@"day"];
        }

        CUTERentPeriodViewController *controller = [[CUTERentPeriodViewController alloc] init];
        CUTERentPeriodForm *form = [CUTERentPeriodForm new];
        form.ticket = self.form.ticket;
        form.needSetPeriod = YES;
        form.rentAvailableTime = ticket.rentAvailableTime ?[NSDate dateWithTimeIntervalSince1970:ticket.rentAvailableTime.doubleValue]: nil;
        form.rentDeadlineTime = ticket.rentDeadlineTime? [NSDate dateWithTimeIntervalSince1970:ticket.rentDeadlineTime.doubleValue]: nil;
        form.minimumRentPeriod = ticket.minimumRentPeriod;

        controller.formController.form = form;
        controller.navigationItem.title = STR(@"租期");
        _editRentPeriodViewController = controller;

        __weak typeof(self)weakSelf = self;

        _editRentPeriodViewController.updatePeriodCompletion = ^ {
            [weakSelf.formController enumerateFieldsWithBlock:^(FXFormField *field, NSIndexPath *indexPath) {
                if ([field.key isEqualToString:@"rentPeriod"]) {
                    [[weakSelf tableView] reloadRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationNone];
                }
            }];
        };
    }

    //in case of push twice time
    if (self.navigationController.topViewController != _editRentPeriodViewController) {
        [self.navigationController pushViewController:_editRentPeriodViewController animated:YES];
    }
}

- (void)editRentType {
    [[[CUTEEnumManager sharedInstance] getEnumsByType:@"rent_type"] continueWithBlock:^id(BFTask *task) {
        if (task.result) {
            CUTERentTypeListForm *form = [[CUTERentTypeListForm alloc] init];
            form.singleUseForReedit = YES;
            form.rentType = self.form.ticket.rentType;
            [form setRentTypeList:task.result];
            CUTERentTypeListViewController *controller = [CUTERentTypeListViewController new];
            form.ticket = self.form.ticket;
            controller.formController.form = form;

            __weak typeof(self)weakSelf = self;
            controller.updateRentTypeCompletion = ^ {
                NSMutableArray *updateIndexes = [NSMutableArray array];
                [weakSelf.formController enumerateFieldsWithBlock:^(FXFormField *field, NSIndexPath *indexPath) {
                    if ([field.key isEqualToString:@"rentType"]) {
                        [updateIndexes addObject:indexPath];
                    }
                    else if ([field.key isEqualToString:@"area"]) {
                        [updateIndexes addObject:indexPath];
                    }
                }];

                [[weakSelf tableView] reloadRowsAtIndexPaths:updateIndexes withRowAnimation:UITableViewRowAnimationNone];
            };

            [self.navigationController pushViewController:controller animated:YES];

        }
        else {
            [SVProgressHUD showErrorWithError:task.error];
        }
        return nil;
    }];

}

- (void)editAddress {
    CUTERentAddressEditViewController *controller = [[CUTERentAddressEditViewController alloc] init];
    CUTERentAddressEditForm *form = [CUTERentAddressEditForm new];
    form.ticket = self.form.ticket;
    form.singleUseForReedit = YES;
    [SVProgressHUD show];
    [[form updateWithTicket:self.form.ticket] continueWithBlock:^id(BFTask *task) {
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
            controller.lastCountry = form.country;
            controller.formController.form = form;
            controller.navigationItem.title = STR(@"房产地址");

            __weak typeof(self)weakSelf = self;
            controller.updateAddressCompletion = ^ {
                [weakSelf.formController enumerateFieldsWithBlock:^(FXFormField *field, NSIndexPath *indexPath) {
                    if ([field.key isEqualToString:@"address"]) {
                        [[weakSelf tableView] reloadRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationNone];
                    }
                }];
            };
            [self.navigationController pushViewController:controller animated:YES];
        }

        return task;
    }];
}

- (void)editMoreInfo {

    TrackEvent(GetScreenName(self), kEventActionPress, @"enter-more", nil);
    CUTETicket *ticket = self.form.ticket;
    CUTERentPropertyMoreInfoViewController *controller = [CUTERentPropertyMoreInfoViewController new];
    CUTEPropertyMoreInfoForm *form = [CUTEPropertyMoreInfoForm new];
    form.ticket = ticket;
    form.ticketTitle = ticket.titleForDisplay;
    form.ticketDescription = ticket.ticketDescription;
    controller.formController.form = form;

    [self.navigationController pushViewController:controller animated:YES];
}


- (BOOL)validate {
    CUTEPropertyInfoForm *form = (CUTEPropertyInfoForm *)self.formController.form;

    if (form.bedroomCount < 1) {
        [SVProgressHUD showErrorWithStatus:STR(@"居室数至少为1个")];
        return NO;
    }

    if (!_editRentPriceViewController && !self.form.ticket.price) {
        [SVProgressHUD showErrorWithStatus:STR(@"请编辑租金")];
        return NO;
    }
    if (fequalzero(self.form.ticket.price.value)) {
        [SVProgressHUD showErrorWithStatus:STR(@"租金不能为0")];
        return NO;
    }
    return YES;
}

- (void)submit
{
    if (![self validate]) {
        return;
    }

    [SVProgressHUD show];
    [[[CUTERentTicketPublisher sharedInstance] editTicket:self.form.ticket updateStatus:^(NSString *status) {
        [SVProgressHUD showWithStatus:status];
    }] continueWithBlock:^id(BFTask *task) {
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
            [[CUTEDataManager sharedInstance] saveRentTicket:task.result];

            TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));
            CUTERentTicketPreviewViewController *controller = [[CUTERentTicketPreviewViewController alloc] init];
            controller.url = [NSURL URLWithString:CONCAT(@"/wechat-poster/", self.form.ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]];
            controller.ticket = self.form.ticket;
            [controller loadRequest:[NSURLRequest requestWithURL:controller.url]];
            [self.navigationController pushViewController:controller animated:YES];
        }
        return task;
    }];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
}

@end
