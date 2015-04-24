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
#import "CUTEAPIManager.h"
#import <Sequencer.h>
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
#import <AssetsLibrary/AssetsLibrary.h>
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEFormImagePickerCell.h"
#import "CUTEPropertyMoreInfoViewController.h"
#import "CUTERentAreaViewController.h"
#import "CUTEImageUploader.h"
#import "CUTEUnfinishedRentTicketViewController.h"
#import "CUTERentTypeListViewController.h"
#import "CUTERentTypeListForm.h"
#import "CUTERentAddressMapViewController.h"
#import "CUTENotificationKey.h"


@interface CUTEPropertyInfoViewController () {

//    CUTEImageUploader *_imageUploader;

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
    //may user have edit, but not submit
    [[CUTEDataManager sharedInstance] saveRentTicketToUnfinised:self.ticket];
    
    NSArray *controllers = self.navigationController.viewControllers;
    if (!IsArrayNilOrEmpty(controllers) && controllers.firstObject != self) {
        if ([controllers.firstObject isKindOfClass:[CUTEUnfinishedRentTicketViewController class]]) {
            [self.navigationController popToRootViewControllerAnimated:YES];
        }
        else {
            CUTEUnfinishedRentTicketViewController *unfinisedController = [CUTEUnfinishedRentTicketViewController new];
            [self.navigationController setViewControllers:@[unfinisedController] animated:YES];
        }
    }
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
    CUTERentAddressMapViewController *mapController = [CUTERentAddressMapViewController new];
    mapController.ticket = self.ticket;
    mapController.singleUseForReedit = YES;
    [self.navigationController pushViewController:mapController animated:YES];
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

    if (form.bedroom < 1) {
        [SVProgressHUD showErrorWithStatus:STR(@"居室数至少为1个")];
        return NO;
    }

    if (!_editAreaViewController) {
        [SVProgressHUD showErrorWithStatus:STR(@"请编辑面积")];
        return NO;
    }
    if (!_editRentPriceViewController) {
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

    [SVProgressHUD show];
    CUTETicket *ticket = self.ticket;
    CUTEProperty *property = ticket.property;
    if (ticket && property) {
        Sequencer *sequencer = [Sequencer new];
        
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[self addProperty] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                    return nil;
                } else {
                    property.identifier = task.result;
                    completion(task.result);
                    return nil;
                }
            }];
        }];

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[[CUTEAPIManager sharedInstance] POST:@"/api/1/rent_ticket/add/" parameters:[ticket toParams] resultClass:nil] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                    return nil;
                } else {
                    ticket.identifier = task.result;
                    completion(task.result);
                    return nil;
                }
            }];
        }];

        //user logged in
        if ([CUTEDataManager sharedInstance].user) {
            [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
                [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/rent_ticket/", ticket.identifier, @"/edit") parameters:
                  @{@"status": kTicketStatusToRent} resultClass:nil] continueWithBlock:^id(BFTask *task) {
                    if (task.error || task.exception || task.isCancelled) {
                        [SVProgressHUD showErrorWithError:task.error];
                        return nil;
                    } else {
                        completion(task.result);
                        [SVProgressHUD dismiss];
                        [self.navigationController popToRootViewControllerAnimated:NO];

                        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                            [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_PUBLISH object:self userInfo:@{@"ticket": ticket}];
                        });
                        return nil;
                    }
                }];
            }];
        }
        else {
            // no user
            [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
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
            }];
        }
        [sequencer run];
    }
}

- (BFTask *)addProperty {
    CUTETicket *ticket = self.ticket;
    CUTEProperty *property = ticket.property;
    FXFormField *propertyTypeField = [self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:0 inSection:1]];
    property.propertyType = propertyTypeField.value;
    FXFormField *bedroomCountField = [self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:1 inSection:1]];
    property.bedroomCount = [bedroomCountField.value integerValue];
    BFTask *task = [[[CUTEAPIManager sharedInstance] POST:@"/api/1/property/none/edit" parameters:[property toParams] resultClass:nil] continueWithBlock:^id(BFTask *task) {
        NSString *propertyId = task.result;
        property.identifier = propertyId;
        return task;
    }];
    return task;
}



@end
