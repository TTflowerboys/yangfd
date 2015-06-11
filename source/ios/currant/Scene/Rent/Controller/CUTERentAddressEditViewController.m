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
#import "CUTERentAddressMapViewController.h"
#import "NSArray+ObjectiveSugar.h"
#import "CUTETicketEditingListener.h"

@interface CUTERentAddressEditViewController () {
    CUTECountry *_lastCountry;
}

@end


@implementation CUTERentAddressEditViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    if (!form.singleUseForReedit) {
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
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.property.country = self.form.country;
    self.ticket.property.city = self.form.city;
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)onStreetEdit:(id)sender {
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.property.street = self.form.street;
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)onHouseNameEdit:(id)sender {
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.property.houseName = self.form.houseName;
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)onCommunityEdit:(id)sender {
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.property.community = self.form.community;
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)onFloorEdit:(id)sender {
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.property.floor = self.form.floor;
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];
}

- (void)onPostcodeEdit:(id)sender {
    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    self.ticket.property.zipcode = self.form.postcode;
    [ticketListener stopListenMark];
    [self syncWithUserInfo:ticketListener.getSyncUserInfo];

    [self updateAddress];
}

- (void)onLocationEdit:(id)sender {
    CUTERentAddressMapViewController *mapController = [CUTERentAddressMapViewController new];
    mapController.ticket = self.ticket;
    mapController.hidesBottomBarWhenPushed = YES;
    mapController.singleUseForReedit = [(CUTERentAddressEditForm *)self.formController.form singleUseForReedit];
    mapController.updateAddressCompletion = ^ {
        CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
        [[form updateWithTicket:self.ticket] continueWithBlock:^id(BFTask *task) {
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
                [self.tableView reloadData];
            }
            
            return task;
        }];
    };
    [self.navigationController pushViewController:mapController animated:YES];
}

- (void)updateAddress {

    NSString *postCodeIndex = [self.ticket.property.zipcode stringByReplacingOccurrencesOfString:@" " withString:@""];
    if (self.ticket.property.country && !IsNilNullOrEmpty(postCodeIndex)) {
        [SVProgressHUD showWithStatus:STR(@"搜索中...")];

        [[[CUTEGeoManager sharedInstance] searchPostcodeIndex:postCodeIndex countryCode:self.ticket.property.country.code] continueWithBlock:^id(BFTask *task) {
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
                CLLocation *location = task.result;
                if (location && [location isKindOfClass:[CLLocation class]]) {

                    CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
                    self.ticket.property.latitude = location.coordinate.latitude;
                    self.ticket.property.longitude = location.coordinate.longitude;
                    [ticketListener stopListenMark];
                    //check is a draft ticket not a unfinished one
                    if (!IsNilNullOrEmpty(self.ticket.identifier)) {
                        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:ticketListener.getSyncUserInfo];
                    }

                    [[[CUTEGeoManager sharedInstance] reverseGeocodeLocation:location] continueWithBlock:^id(BFTask *task) {
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
                                CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
                                self.ticket.property.street = form.street;
                                [ticketListener stopListenMark];
                                [self syncWithUserInfo:ticketListener.getSyncUserInfo];
                                [self.tableView reloadData];
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

- (void)syncWithUserInfo:(NSDictionary *)userInfo {
    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:userInfo];
    if (self.updateAddressCompletion) {
        self.updateAddressCompletion();
    }
}

- (CUTERentAddressEditForm *)form {
    return (CUTERentAddressEditForm *)self.formController.form;
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
            [[BFTask taskForCompletionOfAllTasksWithResults:[@[@"landlord_type", @"property_type"] map:^id(id object) {
                return [[CUTEEnumManager sharedInstance] getEnumsByType:object];
            }]] continueWithBlock:^id(BFTask *task) {
                NSArray *landloardTypes;
                NSArray *propertyTypes;
                if (!IsArrayNilOrEmpty(task.result) && [task.result count] == 2) {
                    landloardTypes = task.result[0];
                    propertyTypes = task.result[1];
                }

                if (!IsArrayNilOrEmpty(landloardTypes) && !IsArrayNilOrEmpty(propertyTypes)) {
                    TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));

                    self.ticket.landlordType = [CUTEPropertyInfoForm getDefaultLandloardType:landloardTypes];
                    self.ticket.property.propertyType = [CUTEPropertyInfoForm getDefaultPropertyType:propertyTypes];

                    CUTERentPropertyInfoViewController *controller = [[CUTERentPropertyInfoViewController alloc] init];
                    controller.ticket = self.ticket;

                    CUTEPropertyInfoForm *form = [CUTEPropertyInfoForm new];
                    form.propertyType = currentTicket.property.propertyType;
                    form.bedroomCount = currentTicket.property.bedroomCount;
                    form.livingroomCount = currentTicket.property.livingroomCount;
                    form.bathroomCount = currentTicket.property.bathroomCount;
                    [form setAllPropertyTypes:propertyTypes];
                    [form setAllLandlordTypes:landloardTypes];
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

                [[[CUTEGeoManager sharedInstance] searchPostcodeIndex:postCodeIndex countryCode:self.ticket.property.country.code]continueWithBlock:^id(BFTask *task) {
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
                        CLLocation *location = task.result;
                        if (location && [location isKindOfClass:[CLLocation class]]) {
                            [self.tableView reloadData];
                            self.ticket.property.latitude = location.coordinate.latitude;
                            self.ticket.property.longitude = location.coordinate.longitude;
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
