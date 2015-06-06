//
//  CUTERentAddressEditViewController.m
//  currant
//
//  Created by Foster Yin on 4/4/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentAddressEditViewController.h"
#import "CUTECommonMacro.h"
#import "CUTERentAddressEditForm.h"
#import "CUTEDataManager.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEDataManager.h"
#import "CUTERentTickePublisher.h"
#import "CUTENotificationKey.h"
#import "CUTEAPIManager.h"
#import "CUTEEnumManager.h"
#import <Sequencer.h>
#import "CUTERentPropertyInfoViewController.h"
#import "CUTETracker.h"
#import "CUTEAPIManager.h"
#import <UIAlertView+Blocks.h>
#import "CUTEGeoManager.h"
#import "CUTEPlacemark.h"

@interface CUTERentAddressEditViewController () {
    CUTECountry *_lastCountry;
}

@end


@implementation CUTERentAddressEditViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    if (!self.singleUseForReedit) {
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"继续") style:UIBarButtonItemStylePlain target:self action:@selector(onContinueButtonPressed:)];
    }
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    [self checkNeedUpdateCityOptions];
}

- (void)checkNeedUpdateCityOptions {

    [self.formController enumerateFieldsWithBlock:^(FXFormField *field, NSIndexPath *indexPath) {
        if ([field.key isEqualToString:@"country"]) {
            CUTECountry *country = field.value;
            if ((_lastCountry || country) && ![_lastCountry isEqual:country]) {
                [[[CUTEEnumManager sharedInstance] getCitiesByCountry:country] continueWithBlock:^id(BFTask *task) {
                    if (task.result) {
                        [(CUTERentAddressEditForm *)self.formController.form setCity:nil];
                        [(CUTERentAddressEditForm *)self.formController.form setAllCities:task.result];
                        [self.formController updateSections];
                        [self.tableView reloadData];
                    }
                    return task;
                }];
            }
            _lastCountry = country;
        }
    }];
}

- (void)optionBack {
    [self.navigationController popViewControllerAnimated:YES];
    [self updateTicket];
}

- (void)onStreetEdit:(id)sender {
    [self updateTicket];
}

- (void)onHouseNameEdit:(id)sender {
    [self updateTicket];
}

- (void)onCommunityEdit:(id)sender {
    [self updateTicket];
}

- (void)onFloorEdit:(id)sender {
    [self updateTicket];
}

- (void)onPostcodeEdit:(id)sender {
    [self updateTicket];
    [self updateAddress];
}

- (void)updateAddress {

    NSString *postCodeIndex = [self.ticket.property.zipcode stringByReplacingOccurrencesOfString:@" " withString:@""];
    if (self.ticket.property.country && !IsNilNullOrEmpty(postCodeIndex)) {
        [SVProgressHUD showWithStatus:STR(@"搜索中...")];
        NSString *components = [CUTEGeoManager buildComponentsWithDictionary:@{@"postal_code": postCodeIndex, @"country": self.ticket.property.country.code, @"locality": self.ticket.property.city.name}];
        [[[CUTEGeoManager sharedInstance] geocodeWithAddress:nil components:components] continueWithBlock:^id(BFTask *task) {
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
                    CUTEPlacemark *placemark = task.result;

                    [[[CUTEGeoManager sharedInstance] reverseGeocodeLocation:placemark.location] continueWithBlock:^id(BFTask *task) {
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
                                CUTEPlacemark *detailPlacemark = task.result;
                                CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
                                form.street = detailPlacemark.street;
                                [self.tableView reloadData];
                                self.ticket.property.latitude = detailPlacemark.location.coordinate.latitude;
                                self.ticket.property.longitude = detailPlacemark.location.coordinate.longitude;
                                [self updateTicket];
                                [SVProgressHUD dismiss];
                            }
                            else {
                                [SVProgressHUD dismiss];
                            }
                        }
                        return task;
                    }];
                }
                else {
                    [SVProgressHUD dismiss];
                }
            }
            return task;
        }];
    }
}

- (void)updateTicket {
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)[self.formController form];
    CUTETicket *ticket = self.ticket;
    CUTEProperty *property = [ticket property];
    property.houseName = form.houseName;
    property.floor = form.floor;
    property.community = form.community;
    property.street = form.street;
    property.city = form.city;
    property.zipcode = form.postcode;
    property.country = form.country;

    //check is a draft ticket not a unfinished one
    if (!IsNilNullOrEmpty(self.ticket.identifier)) {
        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:@{@"ticket": self.ticket}];
    }

    if (self.updateAddressCompletion) {
        self.updateAddressCompletion();
    }
}

- (BOOL)validateForm {
    CUTEProperty *property = [self.ticket property];

    if (!property.country) {
        [SVProgressHUD showErrorWithStatus:STR(@"请填写国家")];
        return NO;
    }
    if (!property.city) {
        [SVProgressHUD showErrorWithStatus:STR(@"请填写城市")];
        return NO;
    }
    if (!property.zipcode) {
        [SVProgressHUD showErrorWithStatus:STR(@"请填写Postcode")];
        return NO;
    }

    return YES;
}

- (void)createTicket {
    CUTETicket *currentTicket = self.ticket;
    if (currentTicket) {
        [SVProgressHUD show];
        Sequencer *sequencer = [Sequencer new];
        if (IsNilNullOrEmpty(currentTicket.identifier)) {
            [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
                [[[CUTERentTickePublisher sharedInstance] createTicket:currentTicket] continueWithBlock:^id(BFTask *task) {
                    if (task.error || task.exception || task.isCancelled) {
                        [SVProgressHUD showErrorWithError:task.error];
                    }
                    else {
                        CUTETicket *newTicket = task.result;
                        currentTicket.identifier = newTicket.identifier;
                        currentTicket.property.identifier = newTicket.property.identifier;
                        [[CUTEDataManager sharedInstance] checkStatusAndSaveRentTicketToUnfinised:newTicket];
                        completion(currentTicket);
                    }
                    return nil;
                }];
            }];
        }

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[[CUTEEnumManager sharedInstance] getEnumsByType:@"property_type"] continueWithBlock:^id(BFTask *task) {
                if (!IsArrayNilOrEmpty(task.result)) {
                    TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));
                    CUTERentPropertyInfoViewController *controller = [[CUTERentPropertyInfoViewController alloc] init];
                    controller.ticket = self.ticket;
                    CUTEPropertyInfoForm *form = [CUTEPropertyInfoForm new];
                    form.propertyType = currentTicket.property.propertyType;
                    form.bedroomCount = currentTicket.property.bedroomCount;
                    form.livingroomCount = currentTicket.property.livingroomCount;
                    form.bathroomCount = currentTicket.property.bathroomCount;
                    [form setAllPropertyTypes:task.result];
                    controller.formController.form = form;
                    [self.navigationController pushViewController:controller animated:YES];
                    [SVProgressHUD dismiss];
                }
                else {
                    [SVProgressHUD showErrorWithError:task.error];
                }

                return nil;
            }];
        }];

        [sequencer run];
    }

}

- (void)onContinueButtonPressed:(id)sender {
    if (![self validateForm]) {
        return;
    }

    if (!IsNilNullOrEmpty(self.ticket.property.zipcode)  && ![self.lastPostcode isEqualToString:self.ticket.property.zipcode]) {
        [UIAlertView showWithTitle:STR(@"是否按新postcode重新定位再继续？") message:nil cancelButtonTitle:STR(@"不用") otherButtonTitles:@[STR(@"好的")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
            if (buttonIndex == alertView.cancelButtonIndex) {
                [self createTicket];
            }
            else {
                [SVProgressHUD show];
                NSString *postCodeIndex = [self.ticket.property.zipcode stringByReplacingOccurrencesOfString:@" " withString:@""];
                NSString *components = [CUTEGeoManager buildComponentsWithDictionary:@{@"postal_code": postCodeIndex, @"country": self.ticket.property.country.code, @"locality": self.ticket.property.city.name}];
                [[[CUTEGeoManager sharedInstance] geocodeWithAddress:nil components:components] continueWithBlock:^id(BFTask *task) {
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
                            CUTEPlacemark *placemark = task.result;
                            [self.tableView reloadData];
                            self.ticket.property.latitude = placemark.location.coordinate.latitude;
                            self.ticket.property.longitude = placemark.location.coordinate.longitude;
                            self.lastPostcode = self.ticket.property.zipcode;
                            [SVProgressHUD dismiss];
                            [self createTicket];
                        }
                        else {
                            [SVProgressHUD showErrorWithStatus:STR(@"重新定位失败")];
                        }
                    }
                    
                    return task;
                }];
            }
        }];
    }
    else {
        [self createTicket];
    }
}


@end
