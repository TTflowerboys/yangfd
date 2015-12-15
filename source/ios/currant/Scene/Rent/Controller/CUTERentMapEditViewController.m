//
//  CUTERentAddressMapViewController.m
//  currant
//
//  Created by Foster Yin on 4/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentMapEditViewController.h"
#import <MapKit/MapKit.h>
#import "CUTECommonMacro.h"
#import "FXForms.h"
#import "CUTEPropertyInfoForm.h"
#import "CUTEMapTextField.h"
#import "CUTERentAddressEditForm.h"
#import "CUTERentAddressEditViewController.h"
#import "CUTEAPICacheManager.h"
#import "CUTEEnum.h"
#import <NSArray+ObjectiveSugar.h>
#import "CUTEDataManager.h"
#import <BBTRestClient.h>
#import "CUTEConfiguration.h"
#import "SVProgressHUD+CUTEAPI.h"
#import <AddressBook/AddressBook.h>
#import <INTULocationManager.h>
#import <Sequencer.h>
#import <UIAlertView+Blocks.h>
#import "CUTERentTicketPublisher.h"
#import "CUTETracker.h"
#import "MasonryMake.h"
#import "CUTECity.h"
#import "CUTEPlacemark.h"
#import "CUTENotificationKey.h"
#import "CUTETooltipView.h"
#import "CUTEUserDefaultKey.h"
#import "JDFTooltipManager.h"
#import "CUTEAddressUtil.h"
#import "CUTEPostcodePlace.h"
#import "currant-Swift.h"


@interface CUTERentMapEditViewController () <MKMapViewDelegate, UITextFieldDelegate>
{
    CUTERentAddressEditViewController *_rentAddressEditViewController;

    CUTETooltipView *_mapTipView;

    BOOL _mapShowCurrentRegion;

    BOOL _isAddressUpdated;

}
@end

@implementation CUTERentMapEditViewController

- (instancetype)init
{
    self = [super init];
    if (self) {

    }
    return self;
}

#pragma -mark Lifecycle

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"RentAddressMap/房产位置");

    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"RentAddressMap/继续") style:UIBarButtonItemStylePlain target:self action:@selector(onContinueButtonPressed:)];

    [self.textField.rightView addGestureRecognizer:[[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(onAddressLocationButtonTapped:)]];
    [self.userLocationButton addTarget:self action:@selector(onUserLocationButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
}

-(void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:YES];

    TrackScreen(GetScreenName(self));
    //update address after edit user's address
    CUTEProperty *property = self.form.ticket.property;
    self.textField.text = property.address;
    [self.textField setNeedsDisplay];

    if (!self.form.ticket.property.latitude || !self.form.ticket.property.longitude) {
        if (_isAddressUpdated) {
            [self onAddressLocationButtonTapped:nil];
            _isAddressUpdated = NO;
        }
        else {
            //wait to make sure indicator animation show
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                [self startUpdateAllWithCurrentLocation];
            });
        }
    }
    else {
        if (_isAddressUpdated) {
            if (!IsNilOrNull(self.form.ticket.property.latitude) && !IsNilOrNull(self.form.ticket.property.longitude)) {
                CLLocation *location = [[CLLocation alloc] initWithLatitude:self.form.ticket.property.latitude.doubleValue longitude:self.form.ticket.property.longitude.doubleValue];
                if (location) {
                    MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(location.coordinate, kRegionDistance, kRegionDistance);
                    [self.mapView setRegion:[self.mapView regionThatFits:region] animated:YES];
                }
            }
            else {
                [self onAddressLocationButtonTapped:nil];
            }
            _isAddressUpdated = NO;
        }
        else {
            if (!IsNilOrNull(self.form.ticket.property.latitude) && !IsNilOrNull(self.form.ticket.property.longitude)) {
                CLLocation *location = [[CLLocation alloc] initWithLatitude:self.form.ticket.property.latitude.doubleValue longitude:self.form.ticket.property.longitude.doubleValue];
                if (location) {
                    MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(location.coordinate, kRegionDistance, kRegionDistance);
                    [self.mapView setRegion:[self.mapView regionThatFits:region] animated:YES];
                }
            }
        }
    }



    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        if (![[NSUserDefaults standardUserDefaults] boolForKey:CUTE_USER_DEFAULT_TIP_MAP_INPUT_DISPLAYED])
        {
            CUTETooltipView *toolTips = [[CUTETooltipView alloc] initWithTargetView:self.textField hostView:self.view tooltipText:STR(@"RentAddressMap/修改或编辑详细地址") arrowDirection:JDFTooltipViewArrowDirectionUp width:170 showCompletionBlock:^{

            } hideCompletionBlock:^{

                if (![[NSUserDefaults standardUserDefaults] boolForKey:CUTE_USER_DEFAULT_TIP_MAP_ADDRESS_BUTTON_DISPLAYED])
                {
                    CUTETooltipView *toolTips = [[CUTETooltipView alloc] initWithTargetView:self.textField.rightView hostView:self.view tooltipText:STR(@"RentAddressMap/按地址定位") arrowDirection:JDFTooltipViewArrowDirectionUp width:120];
                    toolTips.viewForTouchToDismiss = self.textField.rightView;
                    [toolTips show];

                    [[NSUserDefaults standardUserDefaults] setBool:YES forKey:CUTE_USER_DEFAULT_TIP_MAP_ADDRESS_BUTTON_DISPLAYED];
                    [[NSUserDefaults standardUserDefaults] synchronize];
                }
            }];
            toolTips.viewForTouchToDismiss = self.textField;
            [toolTips show];

            [[NSUserDefaults standardUserDefaults] setBool:YES forKey:CUTE_USER_DEFAULT_TIP_MAP_INPUT_DISPLAYED];
            [[NSUserDefaults standardUserDefaults] synchronize];
        }
    });

}

#pragma -mark Action

- (void)onAddressBeginEditing:(id)sender {

    //in case of push twice time
    if (self.navigationController.topViewController == _rentAddressEditViewController) {
        return;
    }

    if (!_rentAddressEditViewController) {
        CUTERentAddressEditViewController *controller = [[CUTERentAddressEditViewController alloc] init];
        controller.navigationItem.title = STR(@"RentAddressMap/房产地址");
        controller.updateAddressCompletion = ^ {
            _isAddressUpdated = YES;
        };
        _rentAddressEditViewController = controller;
    }

    [SVProgressHUD show];
    CUTERentAddressEditForm *form = [CUTERentAddressEditForm new];
    form.ticket = self.form.ticket;
    form.houseName = form.ticket.property.houseName;
    form.floor = form.ticket.property.floor;
    form.community = form.ticket.property.community;
    form.street = form.ticket.property.street;
    form.postcode = form.ticket.property.zipcode;

    Sequencer *sequencer = [Sequencer new];
    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[[CUTEAPICacheManager sharedInstance] getCountriesWithCountryCode:NO] continueWithBlock:^id(BFTask *task) {
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
                NSArray *countries = task.result;
                [form setAllCountries:countries];
                completion(countries);
            }

            return task;
        }];
    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {

        NSArray *countries = (NSArray *)result;

        //if not existed country, set a default one, if location service not work, the case will occur
        if (self.form.ticket.property.country == nil) {
            self.form.ticket.property.country = [countries find:^BOOL(CUTECountry *object) {
                return [object.ISOcountryCode isEqualToString:@"GB"];
            }];
        }

        NSInteger countryIndex = [countries indexOfObject:self.form.ticket.property.country];

        [form setCountry:[countries objectAtIndex:countryIndex]];

        CUTECountry *country = [countries objectAtIndex:countryIndex];
        [[[CUTEAPICacheManager sharedInstance] getCitiesByCountry:country] continueWithBlock:^id(BFTask *task) {
            NSArray *cities = task.result;
            if (!IsArrayNilOrEmpty(cities)) {
                [form setAllCities:cities];
                completion(cities);
            }
            else {
                [SVProgressHUD showErrorWithError:task.error];
            }
            return task;
        }];

    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        NSArray *cities = (NSArray *)result;
        NSInteger cityIndex = [cities indexOfObject:self.form.ticket.property.city];
        if (cityIndex != NSNotFound) {
            [form setCity:[cities objectAtIndex:cityIndex]];
            [[[CUTEAPICacheManager sharedInstance] getNeighborhoodByCity:form.city] continueWithBlock:^id(BFTask *task) {
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
                    [form setAllNeighborhoods:task.result];
                    completion(task.result);
                }

                return task;
            }];

        }
        else {
            completion(nil);
        }
    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [SVProgressHUD dismiss];
        _rentAddressEditViewController.formController.form = form;
        [_rentAddressEditViewController.tableView reloadData];
        [self.navigationController pushViewController:_rentAddressEditViewController animated:YES];
    }];

    [sequencer run];

}

- (void)onAddressLocationButtonTapped:(id)sender {
    [self startUpdateLocationWithAddress];
}

- (void)onUserLocationButtonPressed:(id)sender {
    [self startUpdateAllWithCurrentLocation];
}

- (void)onContinueButtonPressed:(id)sender {
    if (![self validateForm]) {
        return;
    }
    
    CUTETicket *currentTicket = self.form.ticket;
    if (currentTicket) {
        if (IsNilNullOrEmpty(currentTicket.identifier)) {
            [SVProgressHUD show];
            Sequencer *sequencer = [Sequencer new];
            [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
                [[[CUTERentTicketPublisher sharedInstance] createTicket:currentTicket] continueWithBlock:^id(BFTask *task) {
                    if (task.error || task.exception || task.isCancelled) {
                        [SVProgressHUD showErrorWithError:task.error];
                    }
                    else {
                        CUTETicket *newTicket = task.result;
                        if (newTicket && !IsNilNullOrEmpty(newTicket.identifier)) {
                            currentTicket.identifier = newTicket.identifier;
                            currentTicket.property.identifier = newTicket.property.identifier;
                            [[CUTEDataManager sharedInstance] saveRentTicket:newTicket];
                            if ([CUTEDataManager sharedInstance].user) {
                                [NotificationCenter postNotificationName:KNOTIF_MARK_USER_AS_LANDLORD object:self userInfo:@{@"user": [CUTEDataManager sharedInstance].user}];
                            }
                            completion(currentTicket);
                        }
                        else {
                            [SVProgressHUD showErrorWithStatus:STR(@"RentAddressMap/创建房产失败")];
                        }
                    }
                    return nil;
                }];
            }];

            [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
                CUTETicket *ticket = result;
                [SVProgressHUD dismiss];
                TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));
                [self.navigationController openRouteWithURL:[NSURL URLWithString:CONCAT(@"yangfd://property-to-rent/edit/", ticket.identifier)]];
            }];

            [sequencer run];
        }
        else {
            CUTETicket *ticket = currentTicket;
            TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));
            [self.navigationController openRouteWithURL:[NSURL URLWithString:CONCAT(@"yangfd://property-to-rent/edit/", ticket.identifier)]];
        }
    }
}

#pragma -mark Util

- (BOOL)validateForm {
    CUTEProperty *property = [self.form.ticket property];

    if (!property.country) {
        if (!_rentAddressEditViewController) {
            [SVProgressHUD showErrorWithStatus:STR(@"RentAddressMap/请编辑地址")];
        }
        else {
            [SVProgressHUD showErrorWithStatus:STR(@"RentAddressMap/请填写国家")];
        }
        return NO;
    }
    if (!property.city) {
        if (!_rentAddressEditViewController) {
            [SVProgressHUD showErrorWithStatus:STR(@"RentAddressMap/请编辑地址")];
        }
        else {
            [SVProgressHUD showErrorWithStatus:STR(@"RentAddressMap/请填写城市")];
        }
        return NO;
    }
    if (!property.zipcode) {
        if (!_rentAddressEditViewController) {
            [SVProgressHUD showErrorWithStatus:STR(@"RentAddressMap/请编辑地址")];
        }
        else {
            [SVProgressHUD showErrorWithStatus:STR(@"RentAddressMap/请填写Postcode")];
        }
        return NO;
    }

    return YES;
}


#pragma -mark MKMapViewDelegate

- (void)mapView:(MKMapView *)mapView regionDidChangeAnimated:(__unused BOOL)animated
{
    if (_mapShowCurrentRegion) {

        if (_mapTipView) {
            [_mapTipView hideAnimated:YES];
        }

        if (![[NSUserDefaults standardUserDefaults] boolForKey:CUTE_USER_DEFAULT_TIP_MAP_DRAG_DISPLAYED])
        {
            CUTETooltipView *toolTips = [[CUTETooltipView alloc] initWithTargetView:self.annotationView hostView:self.view tooltipText:STR(@"RentAddressMap/拖动地图可以修改房产位置") arrowDirection:JDFTooltipViewArrowDirectionUp width:150];
            [toolTips show];
            _mapTipView = toolTips;

            [[NSUserDefaults standardUserDefaults] setBool:YES forKey:CUTE_USER_DEFAULT_TIP_MAP_DRAG_DISPLAYED];
            [[NSUserDefaults standardUserDefaults] synchronize];
        }

        CLLocation *location = [[CLLocation alloc] initWithLatitude:mapView.centerCoordinate.latitude
                                                          longitude:mapView.centerCoordinate.longitude];
        [self startUpdateAddressWithLocation:location];
    }
    else {
        _mapShowCurrentRegion = YES;
    }
}

#pragma -mark UITextFieldDelegate
- (BOOL)textFieldShouldBeginEditing:(UITextField *)textField {

    return YES;
}

- (void)textFieldDidBeginEditing:(UITextField *)textField
{
    [self onAddressBeginEditing:textField];
    [textField resignFirstResponder];
    [textField endEditing:YES];
}


@end
