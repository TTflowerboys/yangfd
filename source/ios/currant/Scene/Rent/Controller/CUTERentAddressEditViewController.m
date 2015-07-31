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
#import "CUTERentTicketPublisher.h"
#import "CUTENotificationKey.h"
#import "CUTEAPIManager.h"
#import "CUTEAPICacheManager.h"
#import <Sequencer.h>
#import "CUTERentPropertyInfoViewController.h"
#import "CUTETracker.h"
#import "CUTEAPIManager.h"
#import <UIAlertView+Blocks.h>
#import "CUTEGeoManager.h"
#import "CUTEPlacemark.h"
#import "CUTERentAddressMapViewController.h"
#import "NSArray+ObjectiveSugar.h"
#import "CUTEPostcodePlace.h"
#import "CUTEAddressUtil.h"
#import "CUTENavigationUtil.h"

@interface CUTERentAddressEditViewController () {


    BOOL _updateLocationFromAddressFailed;
}

@end


@implementation CUTERentAddressEditViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;

    self.navigationItem.leftBarButtonItem = [CUTENavigationUtil backBarButtonItemWithTarget:self action:@selector(onLeftButtonPressed:)];

    if (!form.singleUseForReedit) {
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"继续") style:UIBarButtonItemStylePlain target:self action:@selector(onContinueButtonPressed:)];
    }
    self.tableView.accessibilityIdentifier = STR(@"地址编辑表单");
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];

    if (self.updateAddressCompletion) {
        self.updateAddressCompletion();
    }
}

- (void)onLeftButtonPressed:(id)sender {

    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    if (form.singleUseForReedit && _updateLocationFromAddressFailed) {

        [UIAlertView showWithTitle:STR(@"新Postcode定位失败，前往地图手动修改房产位置，返回房产信息则不添加房产位置") message:nil cancelButtonTitle:STR(@"返回") otherButtonTitles:@[STR(@"前往地图")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {

            if (buttonIndex == alertView.cancelButtonIndex) {
                [self clearTicketLocation];
                [self.navigationController popViewControllerAnimated:YES];
            }
            else {
                [self onLocationEdit:nil];
            }
        }];

        _updateLocationFromAddressFailed = NO;
        return;
    }
    else if (IsNilOrNull(self.form.ticket.property.latitude) || IsNilOrNull(self.form.ticket.property.longitude)) {

        [UIAlertView showWithTitle:STR(@"请前往地图手动修改房产位置，返回房产信息则不添加房产位置") message:nil cancelButtonTitle:STR(@"返回") otherButtonTitles:@[STR(@"前往地图")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {

            if (buttonIndex == alertView.cancelButtonIndex) {
                [self.navigationController popViewControllerAnimated:YES];
            }
            else {
                [self onLocationEdit:nil];
            }
        }];
        return;
    }

    [self.navigationController popViewControllerAnimated:YES];
}

- (void)updateAddressWhenCountryChange:(CUTECountry *)newCountry {


    [[[CUTEAPICacheManager sharedInstance] getCitiesByCountry:newCountry] continueWithBlock:^id(BFTask *task) {
        CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
        [form setCity:nil];
        [form setAllCities:task.result];
        form.postcode = nil;
        [form setNeighborhood:nil];
        [form setAllNeighborhoods:nil];
        form.street = nil;
        form.community = nil;
        form.floor = nil;
        form.houseName = nil;

        [form syncTicketWithBlock:^(CUTETicket *ticket) {
            ticket.property.country = newCountry;
            ticket.property.city = nil;
            ticket.property.zipcode = nil;
            ticket.property.neighborhood = nil;
            ticket.property.street = nil;
            ticket.property.community = nil;
            ticket.property.floor = nil;
            ticket.property.houseName = nil;
            ticket.property.latitude = nil;
            ticket.property.longitude = nil;
        }];

        [self.formController updateSections];
        [self.tableView reloadData];

        return task;
    }];

}

- (void)updateAddressWhenCityChange:(CUTECity *)newCity {

    [[[CUTEAPICacheManager sharedInstance] getNeighborhoodByCity:newCity] continueWithBlock:^id(BFTask *task) {

        CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
        [form setAllNeighborhoods:task.result];
        form.postcode = nil;
        form.neighborhood = nil;
        form.street = nil;
        form.community = nil;
        form.floor = nil;
        form.houseName = nil;

        [form syncTicketWithBlock:^(CUTETicket *ticket) {
            ticket.property.city = newCity;
            ticket.property.zipcode = nil;
            ticket.property.neighborhood = nil;
            ticket.property.street = nil;
            ticket.property.community = nil;
            ticket.property.floor = nil;
            ticket.property.houseName = nil;
            ticket.property.latitude = nil;
            ticket.property.longitude = nil;
        }];

        [self.formController updateSections];
        [self.tableView reloadData];

        return task;
    }];
}

- (void)updateAddressWhenPostcodeChange:(NSString *)newPostcode {
    Sequencer *sequencer = [Sequencer new];
    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [SVProgressHUD showWithStatus:STR(@"搜索中...")];
        [[self updateLocationWhenPostcodeChange:newPostcode] continueWithBlock:^id(BFTask *task) {
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
                CUTEPostcodePlace *place = task.result;
                CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
                if (place && [place isKindOfClass:[CUTEPostcodePlace class]]) {
                    form.neighborhood = IsArrayNilOrEmpty(place.neighborhoods)? nil: [place.neighborhoods firstObject];

                    [form syncTicketWithBlock:^(CUTETicket *ticket) {
                        ticket.property.zipcode = newPostcode;
                        ticket.property.latitude = place.latitude;
                        ticket.property.longitude = place.longitude;
                        ticket.property.neighborhood = IsArrayNilOrEmpty(place.neighborhoods)? nil: [place.neighborhoods firstObject];
                    }];

                    [self.tableView reloadData];
                    _updateLocationFromAddressFailed = NO;
                    completion(nil);
                }
                else {

                    [form syncTicketWithBlock:^(CUTETicket *ticket) {
                        ticket.property.zipcode = newPostcode;
                        ticket.property.latitude = nil;
                        ticket.property.longitude = nil;
                        ticket.property.neighborhood = nil;
                    }];

                    [SVProgressHUD showErrorWithStatus:STR(@"新Postcode定位失败")];
                    _updateLocationFromAddressFailed = YES;
                }
            }
            return task;
        }];
    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[[CUTEGeoManager sharedInstance] reverseGeocodeLocation:[[CLLocation alloc] initWithLatitude:self.form.ticket.property.latitude.doubleValue longitude:self.form.ticket.property.longitude.doubleValue]] continueWithBlock:^id(BFTask *task) {
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
                CUTEPlacemark *detailPlacemark = task.result;
                CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
                CUTEProperty *property = form.ticket.property;
                NSString *street = property.neighborhood == nil? [CUTEAddressUtil buildAddress:@[NilNullToEmpty(detailPlacemark.street), NilNullToEmpty(detailPlacemark.neighborhood)]]: [CUTEAddressUtil buildAddress:@[NilNullToEmpty(detailPlacemark.street), NilNullToEmpty([(CUTENeighborhood *)property.neighborhood name])]];
                form.street = street;

                [form syncTicketWithBlock:^(CUTETicket *ticket) {
                    ticket.property.street = form.street;
                }];

                [self.tableView reloadData];
                [SVProgressHUD dismiss];
            }

            return task;
        }];
    }];
    
    [sequencer run];
    
}



- (BFTask *)updateLocationWhenPostcodeChange:(NSString *)newPostcode {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];

    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    NSString *postCodeIndex = [newPostcode stringByReplacingOccurrencesOfString:@" " withString:@""];
    if (form.ticket.property.country && !IsNilNullOrEmpty(postCodeIndex)) {
        [[[CUTEGeoManager sharedInstance] searchPostcodeIndex:postCodeIndex countryCode:form.ticket.property.country.ISOcountryCode] continueWithBlock:^id(BFTask *task) {
            NSArray *places = (NSArray *)task.result;
            if (!IsArrayNilOrEmpty(places)) {
                [tcs setResult:places.firstObject];
            }
            else {
                [tcs setError:task.error];
            }
            return task;
        }];
    }

    return tcs.task;
}


- (void)onCountryEdit:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;

    if (![self.form.country isEqual:form.ticket.property.country]) {
        [self updateAddressWhenCountryChange:self.form.country];
    }
}

- (void)onCityEdit:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;

    if (![form.city isEqual:form.ticket.property.city]) {
        [self updateAddressWhenCityChange:form.city];
    }
}


- (void)onPostcodeEdit:(id)sender {
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    if (![form.postcode isEqualToString:form.ticket.property.zipcode]) {
        [self updateAddressWhenPostcodeChange:form.postcode];
    }
}

- (void)onNeighborhoodEdit:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    if (self.form.neighborhood) {
        [form syncTicketWithUpdateInfo:@{@"property.neighborhood": form.neighborhood}];

    }
    else {
        [form syncTicketWithUpdateInfo:@{@"property.neighborhood": [NSNull null]}];
    }
}

- (void)onStreetEdit:(id)sender {
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    [form syncTicketWithUpdateInfo:@{@"property.street": self.form.street}];
}

- (void)onHouseNameEdit:(id)sender {
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    [form syncTicketWithUpdateInfo:@{@"property.houseName": self.form.houseName}];
}

- (void)onCommunityEdit:(id)sender {
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    [form syncTicketWithUpdateInfo:@{@"property.community": self.form.community}];
}

- (void)onFloorEdit:(id)sender {
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    [form syncTicketWithUpdateInfo:@{@"property.floor": self.form.floor}];
}

-  (void)clearTicketLocation {

    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    [form syncTicketWithUpdateInfo:@{@"property.latitude": [NSNull null], @"property.longitude": [NSNull null]}];
}

- (void)onLocationEdit:(id)sender {
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    CUTERentAddressMapViewController *mapController = [CUTERentAddressMapViewController new];
    CUTERentAddressMapForm *mapForm = [CUTERentAddressMapForm new];
    mapForm.ticket = form.ticket;
    mapController.form = mapForm;
    mapController.hidesBottomBarWhenPushed = YES;
    mapController.singleUseForReedit = [(CUTERentAddressEditForm *)self.formController.form singleUseForReedit];
    mapController.updateAddressCompletion = ^ {
        [[form updateWithTicket:form.ticket] continueWithBlock:^id(BFTask *task) {
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

- (CUTERentAddressEditForm *)form {
    return (CUTERentAddressEditForm *)self.formController.form;
}

- (BOOL)validateForm {
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    CUTEProperty *property = [form.ticket property];

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

- (CUTERentPropertyInfoViewController *)createInfoViewControllerWithTicket:(CUTETicket *)currentTicket propertyTypes:(NSArray *)propertyTypes landlordTypes:(NSArray *)landlordTypes {
    CUTERentPropertyInfoViewController *controller = [[CUTERentPropertyInfoViewController alloc] init];

    CUTEPropertyInfoForm *infoForm = [CUTEPropertyInfoForm new];
    infoForm.ticket  = currentTicket;
    infoForm.propertyType = currentTicket.property.propertyType;
    infoForm.bedroomCount = currentTicket.property.bedroomCount? currentTicket.property.bedroomCount.integerValue: 0;
    infoForm.livingroomCount = currentTicket.property.livingroomCount? currentTicket.property.livingroomCount.integerValue: 0;
    infoForm.bathroomCount = currentTicket.property.bathroomCount? currentTicket.property.bathroomCount.integerValue: 0;
    [infoForm setAllPropertyTypes:propertyTypes];
    [infoForm setAllLandlordTypes:landlordTypes];
    controller.formController.form = infoForm;
    return controller;
}

- (void)createTicket {
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    CUTETicket *currentTicket = form.ticket;
    if (currentTicket) {
        [SVProgressHUD show];
        Sequencer *sequencer = [Sequencer new];
        if (IsNilNullOrEmpty(currentTicket.identifier)) {
            [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
                [[[CUTERentTicketPublisher sharedInstance] createTicket:currentTicket] continueWithBlock:^id(BFTask *task) {
                    if (task.error || task.exception || task.isCancelled) {
                        [SVProgressHUD showErrorWithError:task.error];
                    }
                    else {
                        CUTETicket *newTicket = task.result;
                        currentTicket.identifier = newTicket.identifier;
                        currentTicket.property.identifier = newTicket.property.identifier;
                        [[CUTEDataManager sharedInstance] saveRentTicket:newTicket];
                        completion(currentTicket);
                    }
                    return nil;
                }];
            }];
        }

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[BFTask taskForCompletionOfAllTasksWithResults:[@[@"landlord_type", @"property_type"] map:^id(id object) {
                return [[CUTEAPICacheManager sharedInstance] getEnumsByType:object];
            }]] continueWithBlock:^id(BFTask *task) {
                NSArray *landlordTypes = nil;
                NSArray *propertyTypes = nil;
                if (!IsArrayNilOrEmpty(task.result) && [task.result count] == 2) {
                    landlordTypes = task.result[0];
                    propertyTypes = task.result[1];
                }

                if (!IsArrayNilOrEmpty(landlordTypes) && !IsArrayNilOrEmpty(propertyTypes)) {
                    TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));

                    form.ticket.landlordType = [CUTEPropertyInfoForm getDefaultLandloardType:landlordTypes];
                    form.ticket.property.propertyType = [CUTEPropertyInfoForm getDefaultPropertyType:propertyTypes];
                    CUTERentPropertyInfoViewController *controller = [self createInfoViewControllerWithTicket:currentTicket propertyTypes:propertyTypes landlordTypes:landlordTypes];
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


    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;

    if (!form.singleUseForReedit && _updateLocationFromAddressFailed) {
        [UIAlertView showWithTitle:STR(@"新Postcode定位失败，返回地图手动修改房产位置，继续下一步则不添加房产位置") message:nil cancelButtonTitle:STR(@"返回") otherButtonTitles:@[STR(@"下一步")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
            if (buttonIndex == alertView.cancelButtonIndex) {
                [self.navigationController popViewControllerAnimated:YES];
            }
            else {
                [self clearTicketLocation];
                [self createTicket];
            }
        }];

        _updateLocationFromAddressFailed = NO;
        return;
    }
    else if (IsNilOrNull(form.ticket.property.latitude) || IsNilOrNull(form.ticket.property.longitude)) {
        [UIAlertView showWithTitle:STR(@"请返回地图手动修改房产位置，继续下一步则不添加房产位置") message:nil cancelButtonTitle:STR(@"返回") otherButtonTitles:@[STR(@"下一步")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
            if (buttonIndex == alertView.cancelButtonIndex) {
                [self.navigationController popViewControllerAnimated:YES];
            }
            else {
                [self createTicket];
            }
        }];

        return;
    }

    [self createTicket];
}


@end
