//
//  CUTERentAddressMapViewController.m
//  currant
//
//  Created by Foster Yin on 4/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentAddressMapViewController.h"
#import <MapKit/MapKit.h>
#import "CUTECommonMacro.h"
#import "FXForms.h"
#import "CUTEPropertyInfoForm.h"
#import "CUTEMapTextField.h"
#import "CUTERentAddressEditForm.h"
#import "CUTERentAddressEditViewController.h"
#import "CUTERentPropertyInfoViewController.h"
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
#import "CUTEAPIManager.h"
#import "CUTEPlacemark.h"
#import "CUTEGeoManager.h"
#import "CUTENotificationKey.h"
#import "CUTETooltipView.h"
#import "CUTEUserDefaultKey.h"
#import "JDFTooltipManager.h"
#import "CUTEAddressUtil.h"

#define kRegionDistance 800


@interface CUTERentAddressMapViewController () <MKMapViewDelegate, UITextFieldDelegate>
{
    MKMapView *_mapView;

    CUTEMapTextField *_textField;

    CUTERentAddressEditViewController *_rentAddressEditViewController;

    UIButton *_userLocationButton;

    UIImageView *_annotationView;

    CUTETooltipView *_mapTipView;

    BFTask *_updateAddressTask;

    BOOL _mapShowCurrentRegion;

    BOOL _isAddressUpdated;

}
@end

@implementation CUTERentAddressMapViewController

- (instancetype)init
{
    self = [super init];
    if (self) {

    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"房产位置");

    if (!self.singleUseForReedit) {
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"继续") style:UIBarButtonItemStylePlain target:self action:@selector(onContinueButtonPressed:)];
    }

    _mapView = [[MKMapView alloc] init];
    _mapView.frame = CGRectMake(0, StatusBarHeight + TouchHeightDefault, RectWidth(self.view.bounds), RectHeightExclude(self.view.bounds, (StatusBarHeight + TouchHeightDefault)));
//    _mapView.frame = self.view.bounds;
    _mapView.delegate = self;
    [self.view addSubview:_mapView];


    UIImageView *annotationView =  [[UIImageView alloc] init];
    annotationView.image = IMAGE(@"icon-location-building");
    [self.view addSubview:annotationView];

    CGSize imageSize = annotationView.image.size;
    MakeBegin(annotationView)
    MakeCenterXEqualTo(_mapView);
    MakeCenterYEqualTo(_mapView).offset(- imageSize.height / 2);
    MakeEnd
    _annotationView = annotationView;

    _textField = [[CUTEMapTextField alloc] initWithFrame:CGRectMake(16, 30 + TouchHeightDefault + StatusBarHeight, ScreenWidth - 32, 60)];
    _textField.rightView = [[UIImageView alloc] initWithImage:IMAGE(@"map-address-location")];
    _textField.rightViewMode = UITextFieldViewModeAlways;
    _textField.background = [[UIImage imageNamed:@"map-textfield-background"] resizableImageWithCapInsets:UIEdgeInsetsMake(10, 10, 10, 10)];
    _textField.delegate = self;
    [self.view addSubview:_textField];
    _textField.rightView.userInteractionEnabled = YES;
    [_textField.rightView addGestureRecognizer:[[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(onAddressLocationButtonTapped:)]];
    _textField.accessibilityIdentifier = @"MapTextField";
    _textField.accessibilityLabel = @"MapTextField";
    _userLocationButton = [UIButton buttonWithType:UIButtonTypeCustom];
    [_userLocationButton setImage:IMAGE(@"map-user-location") forState:UIControlStateNormal];
    _userLocationButton.frame = CGRectMake(ScreenWidth - 40 -15, ScreenHeight - TabBarHeight - 40 - 15, 40, 40);
    [self.view addSubview:_userLocationButton];
    [_userLocationButton addTarget:self action:@selector(onUserLocationButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
}

-(void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:YES];

    TrackScreen(GetScreenName(self));
    //update address after edit user's address
    CUTEProperty *property = self.form.ticket.property;
    _textField.text = property.address;
    [_textField setNeedsDisplay];


    if (self.singleUseForReedit) {

        if (!self.form.ticket.property.latitude || !self.form.ticket.property.longitude) {
            [self onAddressLocationButtonTapped:nil];
        }
        else {
            CLLocation *location = [[CLLocation alloc] initWithLatitude:self.form.ticket.property.latitude.doubleValue longitude:self.form.ticket.property.longitude.doubleValue];
            if (location) {
                MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(location.coordinate, kRegionDistance, kRegionDistance);
                [_mapView setRegion:[_mapView regionThatFits:region] animated:YES];
            }
        }
    }
    else {
        if (!self.form.ticket.property.latitude || !self.form.ticket.property.longitude) {
            //wait to make sure indicator animation show
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                [self startUpdateLocation];
            });
        }
        else {
            if (_isAddressUpdated) {
                [self onAddressLocationButtonTapped:nil];
                _isAddressUpdated = NO;
            }
            else {
                CLLocation *location = [[CLLocation alloc] initWithLatitude:self.form.ticket.property.latitude.doubleValue longitude:self.form.ticket.property.longitude.doubleValue];
                if (location) {
                    MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(location.coordinate, kRegionDistance, kRegionDistance);
                    [_mapView setRegion:[_mapView regionThatFits:region] animated:YES];
                }
            }
        }
    }


    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        if (![[NSUserDefaults standardUserDefaults] boolForKey:CUTE_USER_DEFAULT_TIP_MAP_INPUT_DISPLAYED])
        {
            CUTETooltipView *toolTips = [[CUTETooltipView alloc] initWithTargetView:_textField hostView:self.view tooltipText:STR(@"点击填写详细地址") arrowDirection:JDFTooltipViewArrowDirectionUp width:150 showCompletionBlock:^{

            } hideCompletionBlock:^{

                if (![[NSUserDefaults standardUserDefaults] boolForKey:CUTE_USER_DEFAULT_TIP_MAP_ADDRESS_BUTTON_DISPLAYED])
                {
                    CUTETooltipView *toolTips = [[CUTETooltipView alloc] initWithTargetView:_textField.rightView hostView:self.view tooltipText:STR(@"按地址定位") arrowDirection:JDFTooltipViewArrowDirectionUp width:120];
                    toolTips.viewForTouchToDismiss = _textField.rightView;
                    [toolTips show];

                    [[NSUserDefaults standardUserDefaults] setBool:YES forKey:CUTE_USER_DEFAULT_TIP_MAP_ADDRESS_BUTTON_DISPLAYED];
                    [[NSUserDefaults standardUserDefaults] synchronize];
                }
            }];
            toolTips.viewForTouchToDismiss = _textField;
            [toolTips show];

            [[NSUserDefaults standardUserDefaults] setBool:YES forKey:CUTE_USER_DEFAULT_TIP_MAP_INPUT_DISPLAYED];
            [[NSUserDefaults standardUserDefaults] synchronize];
        }
    });

}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];

    if (self.updateAddressCompletion) {
        self.updateAddressCompletion();
    }
}


- (void)startUpdateLocation {
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    if (status == kCLAuthorizationStatusDenied || status == kCLAuthorizationStatusRestricted) {
        [UIAlertView showWithTitle:STR(@"此应用程序对您的位置没有访问权，您可以在隐私设置中启用访问权或自行填写地址") message:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
        }];
    }
    else {
        [SVProgressHUD show];
        [[[CUTEGeoManager sharedInstance] requestCurrentLocation] continueWithBlock:^id(BFTask *task) {
            if (task.result) {
                CLLocation *location = task.result;
                CLLocation *centerLocation = [[CLLocation alloc] initWithLatitude:_mapView.centerCoordinate.latitude longitude:_mapView.centerCoordinate.longitude];
                if ([location distanceFromLocation:centerLocation] > 10) {
                    MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(location.coordinate, kRegionDistance, kRegionDistance);
                    [_mapView setRegion:[_mapView regionThatFits:region] animated:YES];
//                    [_mapView addAnnotation:[[MKPlacemark alloc] initWithCoordinate:location.coordinate addressDictionary:nil]];
                }
                CUTERentAddressMapForm *form = self.form;

                //check is a draft ticket not a unfinished one
                if (!IsNilNullOrEmpty(form.ticket.identifier)) {
                    [form syncTicketWithUpdateInfo:@{@"property.latitude": @(location.coordinate.latitude), @"property.longitude": @(location.coordinate.longitude)}];
                }
                else {
                    form.ticket.property.latitude = @(location.coordinate.latitude);
                    form.ticket.property.longitude = @(location.coordinate.longitude);
                }

                [self checkNeedUpdateAddress];

                [SVProgressHUD dismiss];
            }
            else if (task.isCancelled) {
                [SVProgressHUD dismiss];
                [UIAlertView showWithTitle:STR(@"此应用程序对您的位置没有访问权，您可以在隐私设置中启用访问权或自行填写地址") message:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
                }];
            }
            else {
                [SVProgressHUD showErrorWithError:task.error];
            }
            return nil;
        }];
    }
}

- (void)onAddressBeginEditing:(id)sender {
    //cannot edit address by click the field
    if (self.singleUseForReedit) {
        return;
    }

    if (!_rentAddressEditViewController) {
        CUTERentAddressEditViewController *controller = [[CUTERentAddressEditViewController alloc] init];
        controller.navigationItem.title = STR(@"房产地址");
        controller.updateAddressCompletion = ^ {
            _isAddressUpdated = YES;
        };
        _rentAddressEditViewController = controller;
    }

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
        NSInteger countryIndex = [countries indexOfObject:self.form.ticket.property.country];
        if (countryIndex != NSNotFound) {
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
        }
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
    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        _rentAddressEditViewController.formController.form = form;
        [_rentAddressEditViewController.tableView reloadData];
        [self.navigationController pushViewController:_rentAddressEditViewController animated:YES];
    }];

    [sequencer run];

}

- (void)onAddressLocationButtonTapped:(id)sender {
    TrackEvent(GetScreenName(self), kEventActionPress, @"look-up-address", nil);

    if (IsNilNullOrEmpty(_textField.text)) {
        [SVProgressHUD showErrorWithStatus:STR(@"地址不能为空，请编辑地址")];
        return;
    }

    [_textField.indicatorView startAnimating];


    NSString *street = [CUTEAddressUtil buildAddress:@[NilNullToEmpty(self.form.ticket.property.community), NilNullToEmpty(self.form.ticket.property.street)]];
    NSMutableDictionary *componmentsDictionary = [NSMutableDictionary dictionary];
    if (self.form.ticket.property.country.ISOcountryCode) {
        [componmentsDictionary setObject:self.form.ticket.property.country.ISOcountryCode forKey:@"country"];
    }
    if (self.form.ticket.property.city.name) {
        [componmentsDictionary setObject:self.form.ticket.property.city.name forKey:@"locality"];
    }
    NSString *components = [CUTEGeoManager buildComponentsWithDictionary:componmentsDictionary];
    [[[CUTEGeoManager sharedInstance] geocodeWithAddress:street components:components] continueWithBlock:^id(BFTask *task) {
        [_textField.indicatorView stopAnimating];
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
                MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(placemark.location.coordinate, kRegionDistance, kRegionDistance);
                [_mapView setRegion:[_mapView regionThatFits:region] animated:YES];
            }
            else {
                [SVProgressHUD showErrorWithStatus:STR(@"重新定位失败")];
            }
        }

        return task;
    }];
}

- (void)onUserLocationButtonPressed:(id)sender {
    [self startUpdateLocation];
}

- (BOOL)validateForm {
    CUTEProperty *property = [self.form.ticket property];

    if (!property.country) {
        if (!_rentAddressEditViewController) {
            [SVProgressHUD showErrorWithStatus:STR(@"请编辑地址")];
        }
        else {
            [SVProgressHUD showErrorWithStatus:STR(@"请填写国家")];
        }
        return NO;
    }
    if (!property.city) {
        if (!_rentAddressEditViewController) {
            [SVProgressHUD showErrorWithStatus:STR(@"请编辑地址")];
        }
        else {
            [SVProgressHUD showErrorWithStatus:STR(@"请填写城市")];
        }
        return NO;
    }
    if (!property.zipcode) {
        if (!_rentAddressEditViewController) {
            [SVProgressHUD showErrorWithStatus:STR(@"请编辑地址")];
        }
        else {
            [SVProgressHUD showErrorWithStatus:STR(@"请填写Postcode")];
        }
        return NO;
    }

    return YES;
}

- (void)onContinueButtonPressed:(id)sender {
    if (![self validateForm]) {
        return;
    }

    CUTETicket *currentTicket = self.form.ticket;
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
                        if ([CUTEDataManager sharedInstance].user) {
                            [NotificationCenter postNotificationName:KNOTIF_MARK_USER_AS_LANDLORD object:self userInfo:@{@"user": [CUTEDataManager sharedInstance].user}];
                        }
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
                NSArray *landloardTypes = nil;
                NSArray *propertyTypes = nil;
                if (!IsArrayNilOrEmpty(task.result) && [task.result count] == 2) {
                    landloardTypes = task.result[0];
                    propertyTypes = task.result[1];
                }

                if (!IsArrayNilOrEmpty(landloardTypes) && !IsArrayNilOrEmpty(propertyTypes)) {
                    TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));

                    self.form.ticket.landlordType = [CUTEPropertyInfoForm getDefaultLandloardType:landloardTypes];
                    self.form.ticket.property.propertyType = [CUTEPropertyInfoForm getDefaultPropertyType:propertyTypes];
                    CUTERentPropertyInfoViewController *controller = [[CUTERentPropertyInfoViewController alloc] init];
                    CUTEPropertyInfoForm *form = [CUTEPropertyInfoForm new];
                    form.ticket = self.form.ticket;
                    form.propertyType = currentTicket.property.propertyType;
                    form.bedroomCount = currentTicket.property.bedroomCount? currentTicket.property.bedroomCount.integerValue: 0;
                    form.livingroomCount = currentTicket.property.livingroomCount? currentTicket.property.livingroomCount.integerValue: 0;
                    form.bathroomCount = currentTicket.property.bathroomCount? currentTicket.property.bathroomCount.integerValue: 0;
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

- (BFTask *)checkNeedUpdateAddress {
    if (!_updateAddressTask || _updateAddressTask.isCompleted) {
        _updateAddressTask = [self updateAddress];
    }

    return _updateAddressTask;
}

- (BFTask *)updateAddress {
    CUTEProperty *property = self.form.ticket.property;
    BFTaskCompletionSource *tcs  = [BFTaskCompletionSource taskCompletionSource];
    CLLocation *location = [[CLLocation alloc] initWithLatitude:property.latitude.doubleValue longitude:property.longitude.doubleValue];
    if (location) {
        [[[CUTEGeoManager sharedInstance] reverseGeocodeLocation:location] continueWithBlock:^id(BFTask *task) {
            if (task.result) {
                CUTEPlacemark *placemark = task.result;
                NSString *street = property.neighborhood == nil ? [CUTEAddressUtil buildAddress:@[NilNullToEmpty(placemark.street), NilNullToEmpty(placemark.neighborhood)]]: [CUTEAddressUtil buildAddress:@[NilNullToEmpty(placemark.street), NilNullToEmpty([(CUTENeighborhood *)property.neighborhood name])]];
                [self.form syncTicketWithUpdateInfo:@{@"property.street": NilNullToEmpty(street),
                                                      @"property.zipcode": placemark.postalCode == nil? [NSNull null]: placemark.postalCode,
                                                      @"property.country": placemark.country,
                                                      @"property.city": placemark.city == nil? [NSNull null]: placemark.city,
                                                      @"property.community": [NSNull null],
                                                      @"property.floor": [NSNull null],
                                                      @"property.houseName": [NSNull null],
                                                      }];

                _textField.text = property.address;
                [_textField setNeedsDisplay];
                [tcs setResult:_textField.text];
            }
            else {
                TrackEvent(GetScreenName(self), kEventActionRequestReturn, @"non-geocoding-result", nil);
                [tcs setError:task.error];
            }
            return task;
        }];
    }
    else {
        [tcs setError:nil];
    }
    return tcs.task;
}

- (void)mapView:(MKMapView *)mapView regionDidChangeAnimated:(__unused BOOL)animated
{
    if (_mapShowCurrentRegion) {

        if (_mapTipView) {
            [_mapTipView hideAnimated:YES];
        }

        if (![[NSUserDefaults standardUserDefaults] boolForKey:CUTE_USER_DEFAULT_TIP_MAP_DRAG_DISPLAYED])
        {
            CUTETooltipView *toolTips = [[CUTETooltipView alloc] initWithTargetView:_annotationView hostView:self.view tooltipText:STR(@"拖动地图可以修改房产位置") arrowDirection:JDFTooltipViewArrowDirectionUp width:150];
            [toolTips show];
            _mapTipView = toolTips;

            [[NSUserDefaults standardUserDefaults] setBool:YES forKey:CUTE_USER_DEFAULT_TIP_MAP_DRAG_DISPLAYED];
            [[NSUserDefaults standardUserDefaults] synchronize];
        }

        //update field value
        CLLocation *location = [[CLLocation alloc] initWithLatitude:mapView.centerCoordinate.latitude
                                                          longitude:mapView.centerCoordinate.longitude];

        self.form.ticket.property.latitude = @(location.coordinate.latitude);
        self.form.ticket.property.longitude = @(location.coordinate.longitude);
        if (!IsNilNullOrEmpty(self.form.ticket.identifier)) {
            [self.form syncTicketWithUpdateInfo:@{@"property.latitude": @(location.coordinate.latitude), @"property.longitude": @(location.coordinate.longitude)}];
        }

        [_textField.indicatorView startAnimating];
        [[self checkNeedUpdateAddress] continueWithBlock:^id(BFTask *task) {
            [_textField.indicatorView stopAnimating];
            if (task.error || task.exception || task.isCancelled) {
                [SVProgressHUD showErrorWithError:task.error];
                return nil;
            } else {

                return nil;
            }
        }];
    }
    else {
        _mapShowCurrentRegion = YES;
    }
}

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
