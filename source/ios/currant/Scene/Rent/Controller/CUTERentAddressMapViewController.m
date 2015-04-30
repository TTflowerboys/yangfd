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
#import "CUTEPropertyInfoViewController.h"
#import "CUTEEnumManager.h"
#import "CUTEEnum.h"
#import <NSArray+Frankenstein.h>
#import "CUTEDataManager.h"
#import <BBTRestClient.h>
#import "CUTEConfiguration.h"
#import "SVProgressHUD+CUTEAPI.h"
#import <INTULocationManager.h>
#import <Sequencer.h>
#import "CUTERentTickePublisher.h"

@interface CUTERentAddressMapViewController () <MKMapViewDelegate, UITextFieldDelegate>
{
    MKMapView *_mapView;

    CUTEMapTextField *_textField;

    CUTERentAddressEditViewController *_rentAddressEditViewController;

    UIButton *_userLocationButton;

    CLGeocoder *_geocoder;

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
    self.navigationItem.title = STR(@"地址");

    if (self.singleUseForReedit) {
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"保存") style:UIBarButtonItemStylePlain target:self action:@selector(onSaveButtonPressed:)];
    }
    else {
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"继续") style:UIBarButtonItemStylePlain target:self action:@selector(onContinueButtonPressed:)];
    }


    _geocoder = [[CLGeocoder alloc] init];

    _mapView = [[MKMapView alloc] init];
    _mapView.frame = self.view.bounds;
    _mapView.delegate = self;
    [self.view addSubview:_mapView];

    _textField = [[CUTEMapTextField alloc] initWithFrame:CGRectMake(16, 30 + TouchHeightDefault + StatusBarHeight, ScreenWidth - 32, 60)];
    _textField.rightView = [[UIImageView alloc] initWithImage:IMAGE(@"map-address-location")];
    _textField.rightViewMode = UITextFieldViewModeAlways;
    _textField.background = [[UIImage imageNamed:@"map-textfield-background"] resizableImageWithCapInsets:UIEdgeInsetsMake(10, 10, 10, 10)];
    _textField.delegate = self;
    [self.view addSubview:_textField];
    _textField.rightView.userInteractionEnabled = YES;
    [_textField.rightView addGestureRecognizer:[[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(onAddressLocationButtonTapped:)]];
    _userLocationButton = [UIButton buttonWithType:UIButtonTypeCustom];
    [_userLocationButton setImage:IMAGE(@"map-user-location") forState:UIControlStateNormal];
    _userLocationButton.frame = CGRectMake(ScreenWidth - 40 -15, ScreenHeight - TabBarHeight - 40 - 15, 40, 40);
    [self.view addSubview:_userLocationButton];
    [_userLocationButton addTarget:self action:@selector(onUserLocationButtonPressed:) forControlEvents:UIControlEventTouchUpInside];

    UILongPressGestureRecognizer *longPressGesture = [[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(onMapLongPressed:)];
    [longPressGesture setMinimumPressDuration:1.0];
    [_mapView addGestureRecognizer:longPressGesture];

    [self startUpdateLocation];
}

-(void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:YES];

    //update address after edit user's address
    CUTEProperty *property = self.ticket.property;
    _textField.text = property.address;

    if (property.location) {
        [self updateLocation:property.location];
    }
}

- (BFTask *)requestLocation {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    [[INTULocationManager sharedInstance] requestLocationWithDesiredAccuracy:INTULocationAccuracyHouse timeout:30 delayUntilAuthorized:YES block:^(CLLocation *currentLocation, INTULocationAccuracy achievedAccuracy, INTULocationStatus status) {
        if (currentLocation) {
            [tcs setResult:currentLocation];
        }
        else {
            if (status == INTULocationStatusTimedOut) {
                [tcs setError:[NSError errorWithDomain:@"INTULocationManager" code:0 userInfo:@{NSLocalizedDescriptionKey: STR(@"获取当前位置超时")}]];
            }
            else if (status == INTULocationStatusError) {
                [tcs setError:[NSError errorWithDomain:@"INTULocationManager" code:0 userInfo:@{NSLocalizedDescriptionKey: STR(@"获取当前位置失败")}]];
            }
        }

    }];
    return tcs.task;
}

- (void)startUpdateLocation {
    [SVProgressHUD show];
    [[self requestLocation] continueWithBlock:^id(BFTask *task) {
        if (task.result) {
            CLLocation *location = task.result;
            [self updateLocation:location];
            MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(location.coordinate, 800, 800);
            [_mapView setRegion:[_mapView regionThatFits:region] animated:YES];
            return [[self updateAddress] continueWithBlock:^id(BFTask *task) {
                if (task.result) {
                    [SVProgressHUD dismiss];
                }
                else {
                    [SVProgressHUD showErrorWithError:task.error];
                }
                return nil;
            }];
        }
        else {
            [SVProgressHUD showErrorWithError:task.error];
        }
        return nil;
    }];
}

- (void)onAddressBeginEditing:(id)sender {

    Sequencer *sequencer = [Sequencer new];
    if (!_rentAddressEditViewController) {
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            NSArray *requiredEnums = @[@"country", @"city"];
            CUTEProperty *property = self.ticket.property;
            [[BFTask taskForCompletionOfAllTasksWithResults:[requiredEnums map:^id(id object) {
                return [[CUTEEnumManager sharedInstance] getEnumsByType:object];
            }]] continueWithBlock:^id(BFTask *task) {
                if (!IsArrayNilOrEmpty(task.result) && [task.result count] == [requiredEnums count]) {
                    if (!_rentAddressEditViewController) {
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
                        form.street = property.street.value;
                        form.postcode = property.zipcode;
                        controller.formController.form = form;
                        controller.navigationItem.title = STR(@"位置");
                        _rentAddressEditViewController = controller;
                    }
                    completion(_rentAddressEditViewController);
                }
                else {
                    [SVProgressHUD showErrorWithError:task.error];
                }
                return nil;
            }];
        }];
    }

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {

        [self.navigationController pushViewController:_rentAddressEditViewController animated:YES];

    }];

    [sequencer run];
}

- (void)onAddressLocationButtonTapped:(id)sender {

    [SVProgressHUD show];
    [_geocoder geocodeAddressString:_textField.text completionHandler:^(NSArray *placemarks, NSError *error) {
        if (!IsArrayNilOrEmpty(placemarks)) {
            CLPlacemark *placemark = [placemarks firstObject];
            [self updateLocation:placemark.location];
            MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(placemark.location.coordinate, 800, 800);
            [_mapView setRegion:[_mapView regionThatFits:region] animated:YES];
            [SVProgressHUD dismiss];
        }
        else {
            [SVProgressHUD showErrorWithError:error];
        }
    }];
}

- (void)onUserLocationButtonPressed:(id)sender {
    [self startUpdateLocation];
}

- (BOOL)validateForm {
    CUTEProperty *property = [self.ticket property];
    if (!_rentAddressEditViewController && (!property.zipcode || !property.country || !property.city)) {
        [SVProgressHUD showErrorWithStatus:STR(@"请编辑地址")];
        return NO;
    }
    return YES;
}

- (void)onSaveButtonPressed:(id)sender {
    [[CUTEDataManager sharedInstance] saveRentTicketToUnfinised:self.ticket];
    [[CUTERentTickePublisher sharedInstance] editTicket:self.ticket];
    [self.navigationController popViewControllerAnimated:YES];
}

- (void)onContinueButtonPressed:(id)sender {
    if (![self validateForm]) {
        return;
    }
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
                        currentTicket.identifier = task.result[@"ticket_id"];
                        currentTicket.property.identifier = task.result[@"property_id"];
                        completion(currentTicket);
                    }
                    return nil;
                }];
            }];
        }

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[[CUTEEnumManager sharedInstance] getEnumsByType:@"property_type"] continueWithBlock:^id(BFTask *task) {
                if (!IsArrayNilOrEmpty(task.result)) {
                    CUTEPropertyInfoViewController *controller = [[CUTEPropertyInfoViewController alloc] init];
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

- (void)onMapLongPressed:(UIGestureRecognizer *)sender {
    if (sender.state  == UIGestureRecognizerStateBegan) {
        CGPoint touchPoint = [sender locationInView:_mapView];
        CUTEProperty *property = self.ticket.property;
        CLLocationCoordinate2D touchMapCoordinate = [_mapView convertPoint:touchPoint toCoordinateFromView:_mapView];
        CLLocation *location = [[CLLocation alloc] initWithLatitude:touchMapCoordinate.latitude longitude:touchMapCoordinate.longitude];
          if (!property.location || [location distanceFromLocation:property.location] > 10) {
              [sender cancelsTouchesInView];
              [self updateLocation:location];
              [SVProgressHUD show];
              [[self updateAddress] continueWithBlock:^id(BFTask *task) {
                  if (task.error || task.exception || task.isCancelled) {
                      [SVProgressHUD showErrorWithError:task.error];
                      return nil;
                  } else {
                      [SVProgressHUD dismiss];
                      return nil;
                  }
              }];
          }
    }
}

- (BFTask *)reverseGeocodeLocation:(CLLocation *)location {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    [_geocoder reverseGeocodeLocation:location completionHandler:^(NSArray *placemarks, NSError *error) {
        if (!IsArrayNilOrEmpty(placemarks)) {
            [tcs setResult:placemarks.firstObject];
        }
        else {
            [tcs setError:error];
        }
    }];
    return [tcs task];
}

- (BFTask *)updateAddress {

    CUTEProperty *property = self.ticket.property;
    return [[self reverseGeocodeLocation:property.location] continueWithBlock:^id(BFTask *task) {
        if (task.result) {
            CLPlacemark *placemark = task.result;
            NSArray *requiredEnums = @[@"country", @"city"];
            [[BFTask taskForCompletionOfAllTasksWithResults:[requiredEnums map:^id(id object) {
                return [[CUTEEnumManager sharedInstance] getEnumsByType:object];
            }]] continueWithSuccessBlock:^id(BFTask *task) {
                if (!IsArrayNilOrEmpty(task.result) && [task.result count] == [requiredEnums count]) {
                    NSArray *coutries = [task.result[0] collect:^BOOL(CUTEEnum *object) {
                        return [[object slug] isEqualToString:placemark.ISOcountryCode];
                    }];

                    NSArray *cities = [task.result[1] collect:^BOOL(CUTECityEnum *object) {
                        return [[object.country slug] isEqualToString:placemark.ISOcountryCode] && [[[placemark locality] lowercaseString] hasPrefix:[[object value] lowercaseString]];
                    }];
                    property.street = [@[NilNullToEmpty(placemark.subThoroughfare), NilNullToEmpty(placemark.thoroughfare)] componentsJoinedByString:@" "];
                    property.zipcode = placemark.postalCode;
                    property.country = IsArrayNilOrEmpty(coutries)? nil: [coutries firstObject];
                    property.city = IsArrayNilOrEmpty(cities)? nil: [cities firstObject];
                    _textField.text = property.address;
                }
                return task;
            }];
        }
        return task;
    }];
}

- (void)updateLocation:(CLLocation *)location {
    if (location && [location isKindOfClass:[CLLocation class]]) {
        CUTEProperty *property = self.ticket.property;
        property.location = location;
        [_mapView removeAnnotations:_mapView.annotations];
        MKPlacemark *annotation = [[MKPlacemark alloc] initWithCoordinate:location.coordinate addressDictionary:nil];
        [_mapView addAnnotation:annotation];
    }
}

- (void)mapView:(MKMapView *)mapView regionDidChangeAnimated:(__unused BOOL)animated
{
    //update field value
    self.field.value = [[CLLocation alloc] initWithLatitude:mapView.centerCoordinate.latitude
                                                  longitude:mapView.centerCoordinate.longitude];
}

- (MKAnnotationView *)mapView:(MKMapView *)mapView viewForAnnotation:(id <MKAnnotation>)annotation
{
    MKAnnotationView *view = [mapView dequeueReusableAnnotationViewWithIdentifier:@"annotation"];
    if (!view) {
        view = [[MKAnnotationView alloc] initWithAnnotation:annotation reuseIdentifier:@"annotation"];
        //view.canShowCallout = YES;
    }
    view.annotation = annotation;
    view.image = IMAGE(@"icon-location-building");
    return view;
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
