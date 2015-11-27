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
#import "CUTEAPICacheManager.h"
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
#import "CUTEAPIManager.h"
#import "currant-Swift.h"
#import <HHRouter.h>
#import "CUTETooltipView.h"
#import "CUTEUserDefaultKey.h"
#import <Aspects.h>


@interface CUTERentPropertyInfoViewController () {

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

//TODO move all controller preparation to setupRoute, let Controller self-manangement
- (BFTask *)setupRoute {

    NSString *ticketId = self.params[@"ticket_id"];



    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];

    if (IsNilNullOrEmpty(ticketId)) {
        [tcs setError:[NSError errorWithDomain:CUTE_ERROR_DOMAIN code:-1 userInfo:@{NSLocalizedDescriptionKey: STR(@"Ticket Id 不应为空")}]];
    }
    else {
        Sequencer *sequencer = [Sequencer new];

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[BFTask taskForCompletionOfAllTasksWithResults:[@[@"landlord_type", @"property_type"] map:^id(id object) {
                return [[CUTEAPICacheManager sharedInstance] getEnumsByType:object];
            }]] continueWithBlock:^id(BFTask *task) {

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
                    completion(task.result);
                }
                return task;
            }];
        }];
        
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {

            CUTETicket *ticket = [[CUTEDataManager sharedInstance] getRentTicketById:ticketId];
            if (ticket) {
                NSArray *landloardTypes = result[0];
                NSArray *propertyTypes = result[1];

                if (ticket.landlordType == nil) {
                    ticket.landlordType = [CUTEPropertyInfoForm getDefaultLandloardType:landloardTypes];
                }
                if (ticket.property.propertyType == nil) {
                    ticket.property.propertyType = [CUTEPropertyInfoForm getDefaultPropertyType:propertyTypes];
                }

                CUTEPropertyInfoForm *form = [CUTEPropertyInfoForm new];
                form.ticket = ticket;
                form.propertyType = ticket.property.propertyType;
                form.bedroomCount = ticket.property.bedroomCount? ticket.property.bedroomCount.integerValue: 0;
                form.livingroomCount = ticket.property.livingroomCount? ticket.property.livingroomCount.integerValue: 0;
                form.bathroomCount = ticket.property.bathroomCount? ticket.property.bathroomCount.integerValue: 0;
                [form setAllPropertyTypes:propertyTypes];
                [form setAllLandlordTypes:landloardTypes];
                self.formController.form = form;
                completion(ticket);

            }
            else {
                [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/rent_ticket/", ticketId) parameters:nil resultClass:[CUTETicket class]] continueWithBlock:^id(BFTask *task) {
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
                        CUTETicket *ticket = task.result;
                        NSArray *landloardTypes = result[0];
                        NSArray *propertyTypes = result[1];

                        if (ticket.landlordType == nil) {
                            ticket.landlordType = [CUTEPropertyInfoForm getDefaultLandloardType:landloardTypes];
                        }
                        if (ticket.property.propertyType == nil) {
                            ticket.property.propertyType = [CUTEPropertyInfoForm getDefaultPropertyType:propertyTypes];
                        }

                        CUTEPropertyInfoForm *form = [CUTEPropertyInfoForm new];
                        form.ticket = ticket;
                        form.propertyType = ticket.property.propertyType;
                        form.bedroomCount = ticket.property.bedroomCount? ticket.property.bedroomCount.integerValue: 0;
                        form.livingroomCount = ticket.property.livingroomCount? ticket.property.livingroomCount.integerValue: 0;
                        form.bathroomCount = ticket.property.bathroomCount? ticket.property.bathroomCount.integerValue: 0;
                        [form setAllPropertyTypes:propertyTypes];
                        [form setAllLandlordTypes:landloardTypes];
                        self.formController.form = form;
                        completion(ticket);
                        
                    }
                    return task;
                }];
            }

        }];

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {

            CUTEProperty *property = self.form.ticket.property;
            if (IsArrayNilOrEmpty(self.form.ticket.property.surroundings) && property.latitude && property.longitude && !IsNilNullOrEmpty(property.zipcode)) {
                NSString *postCodeIndex = [[property.zipcode stringByReplacingOccurrencesOfString:@" " withString:@""] uppercaseString];
                [[[CUTEGeoManager sharedInstance] searchSurroundingsWithName:nil latitude:property.latitude longitude:property.longitude city:property.city country:property.country propertyPostcodeIndex:postCodeIndex] continueWithBlock:^id(BFTask *task) {
                    [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
                        ticket.property.surroundings  = task.result;
                    }];

                    [tcs setResult:nil];
                    return task;
                }];
            }
            else {
                [tcs setResult:nil];
            }
        }];

        [sequencer run];
    }


    return tcs.task;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"RentPropertyInfo/房产信息");

    self.navigationItem.leftBarButtonItem = [CUTENavigationUtil backBarButtonItemWithTarget:self action:@selector(onLeftButtonPressed:)];

    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"RentPropertyInfo/预览") style:UIBarButtonItemStylePlain target:self action:@selector(onPreviewButtonPressed:)];
    self.tableView.accessibilityLabel = STR(@"RentPropertyInfo/房产信息表单");
    self.tableView.accessibilityIdentifier = self.tableView.accessibilityLabel;
}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
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
            cell.detailTextLabel.text = CONCAT([CUTECurrency symbolOfCurrencyUnit:self.form.ticket.price.unit], [NSString stringWithFormat:@"%@", self.form.ticket.price.value], @"/", STR(@"RentPropertyInfo/周"));
        }
    }
    else if ([field.key isEqualToString:@"rentPeriod"]) {
        if ((IsNilOrNull(self.form.ticket.rentAvailableTime) && IsNilOrNull(self.form.ticket.rentDeadlineTime) && IsNilOrNull(self.form.ticket.minimumRentPeriod))) {
            cell.detailTextLabel.text = STR(@"RentPropertyInfo/不限");
        }
        else if (!IsNilOrNull(self.form.ticket.rentAvailableTime) && !IsNilOrNull(self.form.ticket.minimumRentPeriod)) {
            NSDateFormatter *formatter = [NSDateFormatter new];
            formatter.dateStyle = NSDateFormatterMediumStyle;
            formatter.timeStyle = NSDateFormatterNoStyle;

            cell.detailTextLabel.text = [NSString stringWithFormat:@"%@ %@%@ %d%@", [formatter stringFromDate:[NSDate dateWithTimeIntervalSince1970:self.form.ticket.rentAvailableTime.doubleValue]], STR(@"RentPropertyInfo/起"), STR(@"RentPropertyInfo/至少租"), self.form.ticket.minimumRentPeriod.value, self.form.ticket.minimumRentPeriod.unitForDisplay];
        }
    }
    else if ([field.key isEqualToString:@"rentType"]) {
        if (self.form.ticket.rentType) {
            cell.detailTextLabel.text = self.form.ticket.rentType.value;
        }
    }
    else if ([field.key isEqualToString:@"rentAddress"]) {
        if (self.form.ticket.property) {
            cell.detailTextLabel.text = self.form.ticket.property.address;
        }
    }
    else if ([field.key isEqualToString:@"surrounding"]) {
        cell.detailTextLabel.text = STR(@"RentPropertyInfo/学校，地铁");
        [self checkShowSurroundingTooltipWhenSurroundingCellDisplay:cell];
    }
}

- (void)onLeftButtonPressed:(id)sender {

    if ([self.form.ticket.status isEqual:kTicketStatusDraft]) {
        UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:STR(@"RentPropertyInfo/您确定放弃发布吗？放弃后系统将会将您已填写的信息保存为草稿") message:nil delegate:nil cancelButtonTitle:STR(@"RentPropertyInfo/放弃") otherButtonTitles:STR(@"RentPropertyInfo/取消"), nil];
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
    TrackEvent(GetScreenName(self), kEventActionPress, @"preview", nil);
    [self submitEditingTicket];
}

- (void)checkShowSurroundingTooltipWhenSurroundingCellDisplay:(UITableViewCell *)cell {

    if (![[NSUserDefaults standardUserDefaults] boolForKey:CUTE_USER_DEFAULT_TIP_SURROUNDING_DISPLAYED])
    {
        CUTETooltipView *toolTips = [[CUTETooltipView alloc] initWithTargetView:cell hostView:self.view tooltipText:STR(@"PropertyInfo/轻松描述到周边的地铁和学校有多近") arrowDirection:JDFTooltipViewArrowDirectionDown width:200];

        [toolTips show];

        [self aspect_hookSelector:@selector(viewWillDisappear:) withOptions:AspectPositionBefore | AspectOptionAutomaticRemoval usingBlock:^ (id<AspectInfo> info) {
            [toolTips hideAnimated:YES];
        } error:nil];

        [self.tableView aspect_hookSelector:@selector(hitTest:withEvent:)withOptions:AspectPositionBefore | AspectOptionAutomaticRemoval usingBlock:^ (id<AspectInfo> info) {
            [toolTips hideAnimated:YES];
        } error:nil];

        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:CUTE_USER_DEFAULT_TIP_SURROUNDING_DISPLAYED];
        [[NSUserDefaults standardUserDefaults] synchronize];
    }
}


- (void)editLandlordType {
    CUTEPropertyInfoForm *form = (CUTEPropertyInfoForm *)self.formController.form;
    [self.navigationController popViewControllerAnimated:YES];
    [form syncTicketWithBlock:^(CUTETicket *ticket) {
        ticket.landlordType = form.landlordType;
    }];
}

- (void)editPropertyType {
    CUTEPropertyInfoForm *form = (CUTEPropertyInfoForm *)self.formController.form;
    [self.navigationController popViewControllerAnimated:YES];
    [form syncTicketWithBlock:^(CUTETicket *ticket) {
        ticket.property.propertyType = form.propertyType;
    }];
}

- (void)editRooms:(id)sender {
    CUTEPropertyInfoForm *form = (CUTEPropertyInfoForm *)self.formController.form;
    [form syncTicketWithBlock:^(CUTETicket *ticket) {
        ticket.property.bedroomCount = @(form.bedroomCount);
        ticket.property.livingroomCount = @(form.livingroomCount);
        ticket.property.bathroomCount = @(form.bathroomCount);
    }];
}

- (void)editRentPrice {

    CUTETicket *ticket = self.form.ticket;
    CUTERentPriceViewController *controller = [[CUTERentPriceViewController alloc] init];
    CUTERentPriceForm *form = [CUTERentPriceForm new];
    form.ticket = self.form.ticket;
    form.currency = ticket.price.unit;
    form.rentPrice = ticket.price.value;
    form.deposit = ticket.deposit.value;
    form.billCovered = ticket.billCovered? ticket.billCovered.boolValue: NO;
    controller.formController.form = form;
    controller.navigationItem.title = STR(@"RentPropertyInfo/租金");


    __weak typeof(self)weakSelf = self;
    controller.updatePriceCompletion = ^ {
        [weakSelf.formController enumerateFieldsWithBlock:^(FXFormField *field, NSIndexPath *indexPath) {
            if ([field.key isEqualToString:@"rentPrice"]) {
                [[weakSelf tableView] reloadRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationNone];
            }
        }];
    };


    //in case of push twice time
    if (![self.navigationController.topViewController isKindOfClass:[CUTERentPriceViewController class]]) {
        [self.navigationController pushViewController:controller animated:YES];
    }
}

- (void)editRentPeriod {

    CUTETicket *ticket = self.form.ticket;
    CUTERentPeriodViewController *controller = [[CUTERentPeriodViewController alloc] init];
    CUTERentPeriodForm *form = [CUTERentPeriodForm new];
    form.ticket = self.form.ticket;
    form.needSetPeriod = !(IsNilOrNull(ticket.rentAvailableTime) && IsNilOrNull(ticket.rentDeadlineTime) && IsNilOrNull(ticket.minimumRentPeriod));
    
    form.rentAvailableTime = IsNilOrNull(ticket.rentAvailableTime) ? nil :[NSDate dateWithTimeIntervalSince1970:ticket.rentAvailableTime.doubleValue];
    form.rentDeadlineTime = IsNilOrNull(ticket.rentDeadlineTime)? nil: [NSDate dateWithTimeIntervalSince1970:ticket.rentDeadlineTime.doubleValue];
    form.minimumRentPeriod = IsNilOrNull(ticket.minimumRentPeriod)? nil: ticket.minimumRentPeriod;

    controller.formController.form = form;
    controller.navigationItem.title = STR(@"RentPropertyInfo/租期");


    __weak typeof(self)weakSelf = self;

    controller.updatePeriodCompletion = ^ {
        [weakSelf.formController enumerateFieldsWithBlock:^(FXFormField *field, NSIndexPath *indexPath) {
            if ([field.key isEqualToString:@"rentPeriod"]) {
                [[weakSelf tableView] reloadRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationNone];
            }
        }];
    };

    //in case of push twice time
    if (![self.navigationController.topViewController isKindOfClass:[CUTERentPeriodViewController class]]) {
        [self.navigationController pushViewController:controller animated:YES];
    }
}

- (void)editRentType {
    [[[CUTEAPICacheManager sharedInstance] getEnumsByType:@"rent_type"] continueWithBlock:^id(BFTask *task) {
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
                }];

                [[weakSelf tableView] reloadRowsAtIndexPaths:updateIndexes withRowAnimation:UITableViewRowAnimationNone];

                if (self.form.ticket.property.space) {
                    [SVProgressHUD showWithStatus:STR(@"RentPropertyInfo/请更新面积")];
                }
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
            controller.formController.form = form;
            controller.navigationItem.title = STR(@"RentPropertyInfo/房产地址");

            __weak typeof(self)weakSelf = self;
            controller.updateAddressCompletion = ^ {
                [weakSelf.formController enumerateFieldsWithBlock:^(FXFormField *field, NSIndexPath *indexPath) {
                    if ([field.key isEqualToString:@"rentAddress"]) {
                        [[weakSelf tableView] reloadRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationNone];
                    }
                }];
            };
            [self.navigationController pushViewController:controller animated:YES];
        }

        return task;
    }];
}

- (void)editSurrounding {

    CUTEProperty *property = self.form.ticket.property;
    if (!IsNilNullOrEmpty(property.zipcode)) {

        if (!IsArrayNilOrEmpty(property.surroundings)) {
            CUTESurroundingForm *form = [CUTESurroundingForm new];
            form.ticket = self.form.ticket;
            CUTESurroundingListViewController *controller = [[CUTESurroundingListViewController alloc] initWithForm:form];
            NSString *postCodeIndex = [[property.zipcode stringByReplacingOccurrencesOfString:@" " withString:@""] uppercaseString];
            controller.postcodeIndex = postCodeIndex;
            [self.navigationController pushViewController:controller animated:YES];
        }
        else {
            [SVProgressHUD show];
            NSString *postCodeIndex = [[property.zipcode stringByReplacingOccurrencesOfString:@" " withString:@""] uppercaseString];
            [[[CUTEGeoManager sharedInstance] searchSurroundingsWithName:nil latitude:property.latitude longitude:property.longitude  city:property.city country:property.country propertyPostcodeIndex:postCodeIndex] continueWithBlock:^id(BFTask *task) {

                [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
                    NSArray *result = task.result != nil? task.result: @[];
                    ticket.property.surroundings = result;
                    CUTESurroundingForm *form = [CUTESurroundingForm new];
                    form.ticket = self.form.ticket;
                    CUTESurroundingListViewController *controller = [[CUTESurroundingListViewController alloc] initWithForm:form];
                    controller.postcodeIndex = postCodeIndex;
                    [self.navigationController pushViewController:controller animated:YES];
                    [SVProgressHUD dismiss];
                }];

                return task;
            }];
        }
    }
    else {
        [SVProgressHUD showErrorWithStatus:STR(@"RentPropertyInfo/请添加房产的Postcode")];
    }
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

//TODO move to price edit page
- (BOOL)validate {
    if (!self.form.ticket.price) {
        [SVProgressHUD showErrorWithStatus:STR(@"RentPropertyInfo/请编辑租金")];
        return NO;
    }
    if (fequalzero(self.form.ticket.price.value.floatValue)) {
        [SVProgressHUD showErrorWithStatus:STR(@"RentPropertyInfo/租金不能为0")];
        return NO;
    }
    return YES;
}

- (void)submitEditingTicket {
    if (![self validate]) {
        return;
    }

    [SVProgressHUD show];
    [[[CUTERentTicketPublisher sharedInstance] previewTicket:self.form.ticket updateStatus:^(NSString *status) {
        [SVProgressHUD showWithStatus:status];
    } cancellationToken:nil] continueWithBlock:^id(BFTask *task) {
        
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
            controller.URL = [CUTEPermissionChecker URLWithPath:CONCAT(@"/wechat-poster/", self.form.ticket.identifier)];
            controller.ticket = self.form.ticket;
            [controller loadRequest:[NSURLRequest requestWithURL:controller.URL]];
            [self.navigationController pushViewController:controller animated:YES];
        }
        return task;
    }];
}

- (void)submit
{
    TrackEvent(GetScreenName(self), kEventActionPress, @"preview-and-publish", nil);
    [self submitEditingTicket];
}

@end
