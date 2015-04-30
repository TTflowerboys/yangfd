//
//  CUTEPropertyInfoViewController.m
//  currant
//
//  Created by Foster Yin on 4/8/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPropertyInfoViewController.h"
#import "CUTERentContactViewController.h"
#import "CUTERentContactForm.h"
#import "CUTEDataManager.h"
#import <Bolts/Bolts.h>
#import "CUTEProperty.h"
#import <UIKit/UIKit.h>
#import <BBTRestClient.h>
#import "CUTEConfiguration.h"
#import <BBTJSON.h>
#import <NSArray+Frankenstein.h>
#import "CUTEEnumManager.h"
#import "CUTECommonMacro.h"
#import "CUTERentPriceViewController.h"
#import "CUTERentPriceForm.h"
#import "CUTEAreaForm.h"
#import "CUTEPropertyInfoForm.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEFormImagePickerCell.h"
#import "CUTEPropertyMoreInfoViewController.h"
#import "CUTERentAreaViewController.h"
#import "CUTEUnfinishedRentTicketViewController.h"
#import "CUTERentTypeListViewController.h"
#import "CUTERentTypeListForm.h"
#import "CUTERentAddressMapViewController.h"
#import "CUTENotificationKey.h"
#import "CUTERentTickePublisher.h"
#import "CUTERentAddressEditViewController.h"
#import "CUTERentAddressEditForm.h"

@interface CUTEPropertyInfoViewController () {

    CUTERentAreaViewController *_editAreaViewController;

    CUTERentPriceViewController *_editRentPriceViewController;
}

@end


@implementation CUTEPropertyInfoViewController

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
    self.navigationItem.leftBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"返回") style:UIBarButtonItemStylePlain target:self action:@selector(onLeftButtonPressed:)];
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"预览") style:UIBarButtonItemStylePlain target:nil action:nil];
}


- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    if ([cell isKindOfClass:[CUTEFormImagePickerCell class]]) {
        CUTEFormImagePickerCell *pickerCell = (CUTEFormImagePickerCell *)cell;
        pickerCell.ticket = self.ticket;
        [pickerCell update];
    }
}

- (void)onLeftButtonPressed:(id)sender {
    CUTEPropertyInfoForm *form = (CUTEPropertyInfoForm *)self.formController.form;
    self.ticket.property.bedroomCount = form.bedroomCount;
    self.ticket.property.livingroomCount = form.livingroomCount;
    self.ticket.property.bathroomCount = form.bathroomCount;
    self.ticket.property.propertyType = form.propertyType;
    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:@{@"ticket": self.ticket}];

    [self.navigationController popToRootViewControllerAnimated:YES];
    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_LIST_RELOAD object:nil];
}

- (void)editPropertyType {
    CUTEPropertyInfoForm *form = (CUTEPropertyInfoForm *)self.formController.form;
    self.ticket.property.propertyType = form.propertyType;
    [[CUTEDataManager sharedInstance] saveRentTicketToUnfinised:self.ticket];
    [[CUTERentTickePublisher sharedInstance] editTicket:self.ticket];
    [self.navigationController popViewControllerAnimated:YES];
}

- (void)editRooms:(id)sender {
    CUTEPropertyInfoForm *form = (CUTEPropertyInfoForm *)self.formController.form;
    self.ticket.property.bedroomCount = form.bedroomCount;
    self.ticket.property.livingroomCount = form.livingroomCount;
    self.ticket.property.bathroomCount = form.bathroomCount;
    [[CUTEDataManager sharedInstance] saveRentTicketToUnfinised:self.ticket];
    [[CUTERentTickePublisher sharedInstance] editTicket:self.ticket];
}

- (void)editArea {
  if (!_editAreaViewController) {
      CUTERentAreaViewController *controller = [CUTERentAreaViewController new];
      controller.ticket = self.ticket;
      CUTEAreaForm *form = [CUTEAreaForm new];
      form.area = self.ticket.space.value;
      controller.formController.form = form;
      _editAreaViewController = controller;

  }
  [self.navigationController pushViewController:_editAreaViewController animated:YES];
}

- (void)editRentPrice {
    NSArray *requiredEnums = @[@"deposit_type", @"rent_period"];
    [[BFTask taskForCompletionOfAllTasksWithResults:[requiredEnums map:^id(id object) {
        return [[CUTEEnumManager sharedInstance] getEnumsByType:object];
    }]] continueWithSuccessBlock:^id(BFTask *task) {
        if (!IsArrayNilOrEmpty(task.result) && [task.result count] == [requiredEnums count]) {
          if (!_editRentPriceViewController) {
              CUTETicket *ticket = self.ticket;
              ticket.rentAvailableTime = [NSDate date];
              CUTERentPeriod *defaultRentPeriod = [CUTERentPeriod negotiableRentPeriod];
              ticket.rentPeriod = defaultRentPeriod;
              CUTERentPriceViewController *controller = [[CUTERentPriceViewController alloc] init];
              controller.ticket = self.ticket;
              CUTERentPriceForm *form = [CUTERentPriceForm new];
              form.currency = ticket.price.unit;
              form.depositType = ticket.depositType;
              form.rentPrice = ticket.price.value;
              form.containBill = ticket.billCovered;
              form.needSetPeriod = YES;
              form.rentAvailableTime = ticket.rentAvailableTime;
              form.rentPeriod = ticket.rentPeriod;

              [form setAllDepositTypes:[task.result objectAtIndex:0]];
              [form setAllRentPeriods:[[task.result objectAtIndex:1] arrayByAddingObject:defaultRentPeriod]];
              controller.formController.form = form;
              controller.navigationItem.title = STR(@"租金");
              _editRentPriceViewController = controller;
          }
            [self.navigationController pushViewController:_editRentPriceViewController animated:YES];
        }

        return nil;
    }];

}

- (void)editRentType {
    [[[CUTEEnumManager sharedInstance] getEnumsByType:@"rent_type"] continueWithBlock:^id(BFTask *task) {
        if (task.result) {
            CUTERentTypeListForm *form = [[CUTERentTypeListForm alloc] init];
            form.rentType = self.ticket.rentType;
            [form setRentTypeList:task.result];
            CUTERentTypeListViewController *controller = [CUTERentTypeListViewController new];
            controller.ticket = self.ticket;
            controller.singleUseForReedit = YES;
            controller.formController.form = form;
            [self.navigationController pushViewController:controller animated:YES];

        }
        else {
            [SVProgressHUD showErrorWithError:task.error];
        }
        return nil;
    }];

}

- (void)editLocation {
    NSArray *requiredEnums = @[@"country", @"city"];
    CUTEProperty *property = self.ticket.property;
    [[BFTask taskForCompletionOfAllTasksWithResults:[requiredEnums map:^id(id object) {
        return [[CUTEEnumManager sharedInstance] getEnumsByType:object];
    }]] continueWithBlock:^id(BFTask *task) {
        if (!IsArrayNilOrEmpty(task.result) && [task.result count] == [requiredEnums count]) {
            CUTERentAddressEditViewController *controller = [[CUTERentAddressEditViewController alloc] init];
            controller.ticket = self.ticket;
            CUTERentAddressEditForm *form = [CUTERentAddressEditForm new];
            NSArray *countries = [task.result objectAtIndex:0];
            NSArray *cities = [task.result objectAtIndex:1];
            [form setAllCountries:countries];
            NSInteger countryIndex = [countries indexOfObject:property.country];
            if (countryIndex != NSNotFound) {
                [form setCountry:[countries objectAtIndex:countryIndex]];
                controller.lastCountry = form.country;
            }
            [form setAllCities:cities];
            NSInteger cityIndex = [cities indexOfObject:property.city];
            if (cityIndex != NSNotFound) {
                [form setCity:[cities objectAtIndex:cityIndex]];
            }
            form.street = property.street;
            form.postcode = property.zipcode;
            controller.formController.form = form;
            controller.navigationItem.title = STR(@"位置");
            [self.navigationController pushViewController:controller animated:YES];

        }
        else {
            [SVProgressHUD showErrorWithError:task.error];
        }
        return nil;
    }];
}

- (void)editMoreInfo {
    CUTETicket *ticket = self.ticket;
    CUTEPropertyMoreInfoViewController *controller = [CUTEPropertyMoreInfoViewController new];
    controller.ticket = ticket;
    CUTEPropertyMoreInfoForm *form = [CUTEPropertyMoreInfoForm new];
    form.ticketTitle = ticket.title;
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

    if (!_editAreaViewController && !self.ticket.space) {
        [SVProgressHUD showErrorWithStatus:STR(@"请编辑面积")];
        return NO;
    }
    if (!_editRentPriceViewController && !self.ticket.price) {
        [SVProgressHUD showErrorWithStatus:STR(@"请编辑租金")];
        return NO;
    }
    return YES;
}

- (void)submit
{
    if (![self validate]) {
        return;
    }

    CUTETicket *ticket = self.ticket;
    CUTEProperty *property = ticket.property;

    if (ticket && property) {
        if ([CUTEDataManager sharedInstance].user) {
            [SVProgressHUD showWithStatus:STR(@"发布中...")];
            [[[CUTERentTickePublisher sharedInstance] publishTicket:ticket] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                }
                else {
                    [SVProgressHUD showSuccessWithStatus:STR(@"发布成功")];
                    [self.navigationController popToRootViewControllerAnimated:NO];

                    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_PUBLISH object:self userInfo:@{@"ticket": ticket}];
                    });
                }
                return nil;
            }];
        }
        else {
            [SVProgressHUD show];
            [[[CUTEEnumManager sharedInstance] getEnumsByType:@"country"] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                    return nil;
                } else {
                    CUTERentContactViewController *contactViewController = [CUTERentContactViewController new];
                    contactViewController.ticket = self.ticket;
                    CUTERentContactForm *form = [CUTERentContactForm new];
                    [form setAllCountries:task.result];
                    //set default country same with the property
                    form.country = property.country;
                    contactViewController.formController.form = form;
                    [self.navigationController pushViewController:contactViewController animated:YES];
                    [SVProgressHUD dismiss];
                    return nil;
                }
            }];
        }
    }
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
}

@end
