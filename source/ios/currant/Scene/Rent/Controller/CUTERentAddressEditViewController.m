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
#import "CUTEPostcodePlace.h"
#import "CUTEAddressUtil.h"

@interface CUTERentAddressEditViewController () {


    BOOL _updateLocationFromAddressFailed;
}

@end


@implementation CUTERentAddressEditViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    if (!form.singleUseForReedit) {
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"继续") style:UIBarButtonItemStylePlain target:self action:@selector(onContinueButtonPressed:)];
    }
    self.tableView.accessibilityIdentifier = STR(@"地址编辑表单");
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];

    [SVProgressHUD show];
    [[BFTask taskForCompletionOfAllTasksWithResults:@[[self checkNeedUpdateCityOptions], [self checkNeedUpdateNeighborhoodOptions]]] continueWithSuccessBlock:^id(BFTask *task) {
        [SVProgressHUD dismiss];
        NSArray *taskResults = (NSArray *)task.result;
        if ([taskResults[0] boolValue] || [taskResults[1] boolValue]) {
            [[self tableView] reloadData];
        }
        return task;
    }];

}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];

    if (self.updateAddressCompletion) {
        self.updateAddressCompletion();
    }
}

- (BFTask *)checkNeedUpdateCityOptions {

    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];

    __block BOOL needUpdate = NO;
    [self.formController enumerateFieldsWithBlock:^(FXFormField *field, NSIndexPath *indexPath) {
        if ([field.key isEqualToString:@"country"]) {
            CUTECountry *country = field.value;
            if ((_lastCountry || country) && ![_lastCountry isEqual:country]) {
                needUpdate = YES;
            }
            _lastCountry = country;
        }
    }];

    if (needUpdate) {
        [[[CUTEEnumManager sharedInstance] getCitiesByCountry:_lastCountry] continueWithBlock:^id(BFTask *task) {
            [(CUTERentAddressEditForm *)self.formController.form setCity:nil];
            [(CUTERentAddressEditForm *)self.formController.form setAllCities:task.result];
            [self.formController updateSections];
            [tcs setResult:@(needUpdate)];
            return task;
        }];
    }
    else {
        [tcs setResult:@(needUpdate)];
    }

    return tcs.task;
}

- (BFTask *)checkNeedUpdateNeighborhoodOptions {

    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];

    __block BOOL needUpdate = NO;

    [self.formController enumerateFieldsWithBlock:^(FXFormField *field, NSIndexPath *indexPath) {
        if ([field.key isEqualToString:@"city"]) {
            CUTECity *city = field.value;
            if ((_lastCity || city) && ![_lastCity isEqual:city]) {
                needUpdate = YES;
            }
            _lastCity = city;
        }
    }];

    if (needUpdate) {
        [[[CUTEEnumManager sharedInstance] getNeighborhoodByCity:_lastCity] continueWithBlock:^id(BFTask *task) {

            [(CUTERentAddressEditForm *)self.formController.form setNeighborhood:IsArrayNilOrEmpty(self.form.ticket.property.neighborhoods)? nil: [self.form.ticket.property.neighborhoods firstObject]];
            [(CUTERentAddressEditForm *)self.formController.form setAllNeighborhoods:task.result];
            [self.formController updateSections];
            [tcs setResult:@(needUpdate)];
            return task;
        }];
    }
    else {
        [tcs setResult:@(needUpdate)];
    }

    return tcs.task;
}

- (void)onCountryEdit:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    [form syncTicketWithUpdateInfo:@{@"property.country": self.form.country,}];
}

- (void)onCityEdit:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    if (self.form.city) {
        [form syncTicketWithUpdateInfo:@{@"property.city": self.form.city}];

    }
    else {
        [form syncTicketWithUpdateInfo:@{@"property.city": [NSNull null]}];
    }
}

- (void)onNeighborhoodEdit:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    if (self.form.neighborhood) {
        [form syncTicketWithUpdateInfo:@{@"property.neighborhoods": @[form.neighborhood]}];

    }
    else {
        [form syncTicketWithUpdateInfo:@{@"property.neighborhoods": [NSNull null]}];
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

- (void)onPostcodeEdit:(id)sender {
    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    [form syncTicketWithUpdateInfo:@{@"property.zipcode": self.form.postcode}];
    [self updateAddressWithGetLocationSuccessBlock:^{
        _updateLocationFromAddressFailed = NO;

    } failedBlock:^{

        CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
        if (form.singleUseForReedit) {


            form.ticket.property.latitude = nil;
            form.ticket.property.longitude = nil;
            //check is a draft ticket not a unfinished one
            if (!IsNilNullOrEmpty(form.ticket.identifier)) {
                [form syncTicketWithUpdateInfo:@{@"property.latitude": [NSNull null], @"property.longitude": [NSNull null]}];
            }

            [SVProgressHUD dismiss];
            [UIAlertView showWithTitle:STR(@"新Postcode定位失败，前往地图手动修改房产位置，返回房产信息则不添加房产位置") message:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {

            }];
        }
        else {
            [SVProgressHUD showErrorWithStatus:STR(@"新Postcode定位失败")];
            _updateLocationFromAddressFailed = YES;
        }
        return;
    }];
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

- (void)updateAddressWithGetLocationSuccessBlock:(dispatch_block_t)successBlock failedBlock:(dispatch_block_t)failedBlock {

    CUTERentAddressEditForm *form = (CUTERentAddressEditForm *)self.formController.form;
    NSString *postCodeIndex = [form.ticket.property.zipcode stringByReplacingOccurrencesOfString:@" " withString:@""];
    if (form.ticket.property.country && !IsNilNullOrEmpty(postCodeIndex)) {
        [SVProgressHUD showWithStatus:STR(@"搜索中...")];

        [[[CUTEGeoManager sharedInstance] searchPostcodeIndex:postCodeIndex countryCode:form.ticket.property.country.code] continueWithBlock:^id(BFTask *task) {

            NSArray *places = (NSArray *)task.result;
            if (!IsArrayNilOrEmpty(places)) {
                CUTEPostcodePlace *place = [places firstObject];
                form.ticket.property.latitude = place.latitude;
                form.ticket.property.longitude = place.longitude;
                form.ticket.property.neighborhoods = place.neighborhoods;

                form.neighborhood = IsArrayNilOrEmpty(place.neighborhoods)? nil: [place.neighborhoods firstObject];
                [self.tableView reloadData];

                //check is a draft ticket not a unfinished one
                if (!IsNilNullOrEmpty(form.ticket.identifier)) {
                    NSMutableDictionary *updateInfo = [NSMutableDictionary dictionaryWithDictionary:@{@"property.latitude": place.latitude, @"property.longitude": place.longitude}];
                    if (place.neighborhoods) {
                        [updateInfo setObject:place.neighborhoods forKey:@"property.neighborhoods"];
                    }
                    [form syncTicketWithUpdateInfo:updateInfo];
                }

                [[[CUTEGeoManager sharedInstance] reverseGeocodeLocation:[[CLLocation alloc] initWithLatitude:place.latitude.doubleValue longitude:place.longitude.doubleValue]] continueWithBlock:^id(BFTask *task) {
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
                            CUTEProperty *property = form.ticket.property;
                            NSString *street = IsArrayNilOrEmpty(property.neighborhoods)? [CUTEAddressUtil buildAddress:@[detailPlacemark.street, detailPlacemark.neighborhood]]: [CUTEAddressUtil buildAddress:@[detailPlacemark.street, [(CUTENeighborhood *)property.neighborhoods.firstObject name]]];
                            form.street = street;
                            [form syncTicketWithUpdateInfo:@{@"property.street": form.street}];
                            [self.tableView reloadData];
                            [SVProgressHUD dismiss];
                        }
                        else {
                            [SVProgressHUD dismiss];
                        }
                    }
                    return task;
                }];

                if (successBlock) {
                    successBlock();
                }
            }
            else {
                if (failedBlock) {
                    failedBlock();
                }

            }
            return task;
        }];
    }
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
                return [[CUTEEnumManager sharedInstance] getEnumsByType:object];
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

    if (_updateLocationFromAddressFailed) {
        if (!form.singleUseForReedit){
            [UIAlertView showWithTitle:STR(@"新Postcode定位失败，返回地图手动修改房产位置，继续下一步则不添加房产位置") message:nil cancelButtonTitle:STR(@"返回") otherButtonTitles:@[STR(@"下一步")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {

                if (buttonIndex == alertView.cancelButtonIndex) {
                    [self.navigationController popViewControllerAnimated:YES];
                }
                else {
                    form.ticket.property.latitude = nil;
                    form.ticket.property.longitude = nil;
                    [self createTicket];
                }
            }];
        }

        _updateLocationFromAddressFailed = NO;
        return;
    }


    if (!IsNilNullOrEmpty(form.ticket.property.zipcode)  && ![self.lastPostcode isEqualToString:form.ticket.property.zipcode]) {
        [UIAlertView showWithTitle:STR(@"是否按新postcode重新定位再继续？") message:nil cancelButtonTitle:STR(@"不用") otherButtonTitles:@[STR(@"好的")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
            if (buttonIndex == alertView.cancelButtonIndex) {
                [self createTicket];
            }
            else {
                [SVProgressHUD show];
                NSString *postCodeIndex = [form.ticket.property.zipcode stringByReplacingOccurrencesOfString:@" " withString:@""];

                [[[CUTEGeoManager sharedInstance] searchPostcodeIndex:postCodeIndex countryCode:form.ticket.property.country.code]continueWithBlock:^id(BFTask *task) {
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
                        NSArray *places = (NSArray *)task.result;
                        if (!IsArrayNilOrEmpty(places)) {
                            CUTEPostcodePlace *place = [places firstObject];
                            form.neighborhood = IsArrayNilOrEmpty(place.neighborhoods)? nil: [place.neighborhoods firstObject];
                            [self.tableView reloadData];
                            form.ticket.property.latitude = place.latitude;
                            form.ticket.property.longitude = place.longitude;
                            form.ticket.property.neighborhoods = place.neighborhoods;
                            self.lastPostcode = form.ticket.property.zipcode;
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
