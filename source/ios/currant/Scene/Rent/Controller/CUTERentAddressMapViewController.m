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
    self.navigationItem.title = STR(@"RentAddressMap/房产位置");

    if (!self.singleUseForReedit) {
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"RentAddressMap/继续") style:UIBarButtonItemStylePlain target:self action:@selector(onContinueButtonPressed:)];
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
            if (!IsNilOrNull(self.form.ticket.property.latitude) && !IsNilOrNull(self.form.ticket.property.longitude)) {
                CLLocation *location = [[CLLocation alloc] initWithLatitude:self.form.ticket.property.latitude.doubleValue longitude:self.form.ticket.property.longitude.doubleValue];
                if (location) {
                    MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(location.coordinate, kRegionDistance, kRegionDistance);
                    [_mapView setRegion:[_mapView regionThatFits:region] animated:YES];
                }
            }
        }
    }
    else {
        if (!self.form.ticket.property.latitude || !self.form.ticket.property.longitude) {
            if (_isAddressUpdated) {
                [self onAddressLocationButtonTapped:nil];
                _isAddressUpdated = NO;
            }
            else {
                //wait to make sure indicator animation show
                dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                    [self startUpdateLocation];
                });
            }
        }
        else {
            if (_isAddressUpdated) {
                if (!IsNilOrNull(self.form.ticket.property.latitude) && !IsNilOrNull(self.form.ticket.property.longitude)) {
                    CLLocation *location = [[CLLocation alloc] initWithLatitude:self.form.ticket.property.latitude.doubleValue longitude:self.form.ticket.property.longitude.doubleValue];
                    if (location) {
                        MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(location.coordinate, kRegionDistance, kRegionDistance);
                        [_mapView setRegion:[_mapView regionThatFits:region] animated:YES];
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
                        [_mapView setRegion:[_mapView regionThatFits:region] animated:YES];
                    }
                }
            }
        }
    }


    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        if (![[NSUserDefaults standardUserDefaults] boolForKey:CUTE_USER_DEFAULT_TIP_MAP_INPUT_DISPLAYED])
        {
            CUTETooltipView *toolTips = [[CUTETooltipView alloc] initWithTargetView:_textField hostView:self.view tooltipText:STR(@"RentAddressMap/点击填写详细地址") arrowDirection:JDFTooltipViewArrowDirectionUp width:150 showCompletionBlock:^{

            } hideCompletionBlock:^{

                if (![[NSUserDefaults standardUserDefaults] boolForKey:CUTE_USER_DEFAULT_TIP_MAP_ADDRESS_BUTTON_DISPLAYED])
                {
                    CUTETooltipView *toolTips = [[CUTETooltipView alloc] initWithTargetView:_textField.rightView hostView:self.view tooltipText:STR(@"RentAddressMap/按地址定位") arrowDirection:JDFTooltipViewArrowDirectionUp width:120];
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

- (void)startUpdateLocation {
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    if (status == kCLAuthorizationStatusDenied || status == kCLAuthorizationStatusRestricted) {
        [UIAlertView showWithTitle:STR(@"RentAddressMap/此应用程序对您的位置没有访问权，您可以在隐私设置中启用访问权或自行填写地址") message:nil cancelButtonTitle:STR(@"RentAddressMap/OK") otherButtonTitles:nil tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
        }];
    }
    else {
        [SVProgressHUD show];
        [[[CUTEGeoManager sharedInstance] requestCurrentLocation:nil] continueWithBlock:^id(BFTask *task) {
            if (task.result) {
                CLLocation *location = task.result;
                CLLocation *centerLocation = [[CLLocation alloc] initWithLatitude:_mapView.centerCoordinate.latitude longitude:_mapView.centerCoordinate.longitude];
                if ([location distanceFromLocation:centerLocation] > 10) {
                    MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(location.coordinate, kRegionDistance, kRegionDistance);
                    [_mapView setRegion:[_mapView regionThatFits:region] animated:YES];
//                    [_mapView addAnnotation:[[MKPlacemark alloc] initWithCoordinate:location.coordinate addressDictionary:nil]];
                }
                CUTERentAddressMapForm *form = self.form;

                [form syncTicketWithBlock:^(CUTETicket *ticket) {
                    ticket.property.latitude = @(location.coordinate.latitude);
                    ticket.property.longitude = @(location.coordinate.longitude);
                }];


                [self checkNeedUpdateAddressWithCancellationToken:nil];

                [SVProgressHUD dismiss];
            }
            else if (task.isCancelled) {
                [SVProgressHUD dismiss];
                [UIAlertView showWithTitle:STR(@"RentAddressMap/此应用程序对您的位置没有访问权，您可以在隐私设置中启用访问权或自行填写地址") message:nil cancelButtonTitle:STR(@"RentAddressMap/OK") otherButtonTitles:nil tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
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
    TrackEvent(GetScreenName(self), kEventActionPress, @"look-up-address", nil);

    if (IsNilNullOrEmpty(_textField.text)) {
        [SVProgressHUD showErrorWithStatus:STR(@"RentAddressMap/地址不能为空，请编辑地址")];
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
    [[[CUTEGeoManager sharedInstance] geocodeWithAddress:street components:components cancellationToken:nil] continueWithBlock:^id(BFTask *task) {
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
                [SVProgressHUD showErrorWithStatus:STR(@"RentAddressMap/重新定位失败")];
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

- (BFTask *)checkNeedUpdateAddressWithCancellationToken:(BFCancellationToken * _Nullable)cancellationToken {
    if (!_updateAddressTask || _updateAddressTask.isCompleted) {
        _updateAddressTask = [self updateAddressWithCancellationToken:cancellationToken];
    }

    return _updateAddressTask;
}

- (BFTask *)updateAddressWithCancellationToken:(BFCancellationToken * __nullable)cancellationToken {
    CUTEProperty *property = self.form.ticket.property;
    BFTaskCompletionSource *tcs  = [BFTaskCompletionSource taskCompletionSource];
    CLLocation *location = [[CLLocation alloc] initWithLatitude:property.latitude.doubleValue longitude:property.longitude.doubleValue];
    if (location) {
        [[[CUTEGeoManager sharedInstance] reverseGeocodeLocation:location cancellationToken:cancellationToken] continueWithBlock:^id(BFTask *task) {
            if (task.isCancelled) {
                if (!tcs.task.isCompleted) {
                    [tcs cancel];
                }
            }
            else if (task.result) {
                CUTEPlacemark *placemark = task.result;
                [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
                    if (placemark.country) {
                        ticket.property.country = placemark.country;
                    }

                    if (placemark.city) {
                        ticket.property.city = placemark.city;
                    }
                    
                    ticket.property.zipcode = placemark.postalCode;
                    ticket.property.neighborhood = nil;
                    ticket.property.street = [CUTEAddressUtil buildAddress:@[NilNullToEmpty(placemark.street), NilNullToEmpty(placemark.neighborhood)]];
                    ticket.property.community = nil;
                    ticket.property.floor = nil;
                    ticket.property.houseName = nil;
                }];

                if (!IsNilNullOrEmpty(self.form.ticket.property.zipcode)) {
                    [[self updateNeighborhoodWithPostcodeChange:self.form.ticket.property.zipcode countryCode:self.form.ticket.property.country.ISOcountryCode cancellationToken:cancellationToken] continueWithBlock:^id(BFTask *task) {
                        if (task.isCancelled) {
                            if (!tcs.task.isCompleted) {
                                [tcs cancel];
                            }
                        }
                        else if (task.result) {
                            [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
                                ticket.property.neighborhood = task.result;
                            }];

                            _textField.text = property.address;
                            [_textField setNeedsDisplay];
                            [tcs setResult:_textField.text];
                        }
                        else {
                            _textField.text = property.address;
                            [_textField setNeedsDisplay];
                            [tcs setResult:_textField.text];
                        }

                        return task;
                    }];
                }
                else {

                    _textField.text = property.address;
                    [_textField setNeedsDisplay];
                    [tcs setResult:_textField.text];
                }
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

- (BFTask *)updateNeighborhoodWithPostcodeChange:(NSString *)newPostcode countryCode:(NSString *)countryCode cancellationToken:(BFCancellationToken * __nullable)cancellationToken {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    NSString *postCodeIndex = [[newPostcode stringByReplacingOccurrencesOfString:@" " withString:@""] uppercaseString];

    [[[CUTEGeoManager sharedInstance] searchPostcodeIndex:postCodeIndex countryCode:countryCode cancellationToken:cancellationToken] continueWithBlock:^id(BFTask *task) {

        NSArray *places = (NSArray *)task.result;
        if (task.isCancelled) {
            if (!tcs.task.isCompleted) {
                [tcs cancel];
            }
        }
        else if (!IsArrayNilOrEmpty(places)) {
            CUTEPostcodePlace *place = places.firstObject;
            if (place && [place isKindOfClass:[CUTEPostcodePlace class]]) {
                CUTENeighborhood *neighborhood = IsArrayNilOrEmpty(place.neighborhoods)? nil: [place.neighborhoods firstObject];
                [tcs setResult:neighborhood];
            }
            else {
                [tcs setError:[NSError errorWithDomain:CUTE_ERROR_DOMAIN code:-1 userInfo:@{NSLocalizedDescriptionKey: STR(@"API/返回格式不正确")}]];
            }
        }
        else {
            [tcs setError:task.error];
        }
        return task;
    }];


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
            CUTETooltipView *toolTips = [[CUTETooltipView alloc] initWithTargetView:_annotationView hostView:self.view tooltipText:STR(@"RentAddressMap/拖动地图可以修改房产位置") arrowDirection:JDFTooltipViewArrowDirectionUp width:150];
            [toolTips show];
            _mapTipView = toolTips;

            [[NSUserDefaults standardUserDefaults] setBool:YES forKey:CUTE_USER_DEFAULT_TIP_MAP_DRAG_DISPLAYED];
            [[NSUserDefaults standardUserDefaults] synchronize];
        }




        CLLocation *location = [[CLLocation alloc] initWithLatitude:mapView.centerCoordinate.latitude
                                                          longitude:mapView.centerCoordinate.longitude];

        CLLocation *oldLocation = nil;
        if (self.form.ticket.property.latitude && self.form.ticket.property.longitude) {
            oldLocation = [[CLLocation alloc] initWithLatitude:self.form.ticket.property.latitude.doubleValue longitude:self.form.ticket.property.longitude.doubleValue];
        }

        //这里检查location是否被改动过，改了，则去更新相关属性，因为是浮点数，用 2m 作为一个 threshold 来比较
        //update field value
        CLLocationDistance distanceThreshold = 2.0; // in meters
        if (oldLocation == nil || ([oldLocation distanceFromLocation:location] > distanceThreshold)) {

            [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
                ticket.property.latitude = @(location.coordinate.latitude);
                ticket.property.longitude = @(location.coordinate.longitude);
            }];

            [_textField.indicatorView startAnimating];
            [[self checkNeedUpdateAddressWithCancellationToken:nil] continueWithBlock:^id(BFTask *task) {
                [_textField.indicatorView stopAnimating];
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                    return nil;
                } else {
                    
                    return nil;
                }
            }];
        }
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
