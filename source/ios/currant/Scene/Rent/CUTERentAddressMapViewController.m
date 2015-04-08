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
#import "CUTEPlacemark.h"
#import "CUTERentAddressEditViewController.h"
#import "CUTEEnumManager.h"
#import "CUTEEnum.h"
#import <NSArray+Frankenstein.h>
#import "CUTEDataManager.h"

@interface CUTERentAddressMapViewController () <MKMapViewDelegate, CLLocationManagerDelegate, UITextFieldDelegate>
{
    MKMapView *_mapView;

    CUTEMapTextField *_textField;

    UIButton *_userLocationButton;

    CLLocationManager *_locationManager;

    CLLocation *_location;

    CLGeocoder *_geocoder;

    CUTEPlacemark *_placemark;
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
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"继续") style:UIBarButtonItemStylePlain target:self action:@selector(onRightButtonPressed:)];

    _locationManager = [[CLLocationManager alloc] init];
    _locationManager.delegate = self;
    _locationManager.distanceFilter = kCLDistanceFilterNone;
    _locationManager.desiredAccuracy = kCLLocationAccuracyBest;

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

}

-(void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:YES];
    if ([CLLocationManager locationServicesEnabled]) {

        if (SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(@"8.0")) {
            [_locationManager requestWhenInUseAuthorization];
            [_locationManager requestAlwaysAuthorization];
        }
        [_locationManager startUpdatingLocation];
        //_mapView.showsUserLocation = YES;
    }
}

- (void)onAddressBeginEditing:(id)sender {
    NSArray *requiredEnums = @[@"country", @"city"];

    [[BFTask taskForCompletionOfAllTasksWithResults:[requiredEnums map:^id(id object) {
        return [[CUTEEnumManager sharedInstance] getEnumsByType:object];
    }]] continueWithSuccessBlock:^id(BFTask *task) {
        if (!IsArrayNilOrEmpty(task.result) && [task.result count] == [requiredEnums count]) {
            CUTERentAddressEditViewController *controller = [[CUTERentAddressEditViewController alloc] init];
            CUTERentAddressEditForm *form = [CUTERentAddressEditForm new];
            NSArray *countries = [task.result objectAtIndex:0];
            NSArray *cities = [task.result objectAtIndex:1];
            [form setAllCountries:countries];
            NSInteger countryIndex = [countries indexOfObject:_placemark.country];
            if (countryIndex != NSNotFound) {
                [form setDefaultCountry:[countries objectAtIndex:countryIndex]];
            }
            [form setAllCities:cities];
            NSInteger cityIndex = [cities indexOfObject:_placemark.city];
            if (cityIndex != NSNotFound) {
                [form setDefaultCity:[cities objectAtIndex:cityIndex]];
            }
            controller.formController.form = form;

            controller.navigationItem.title = STR(@"位置");
            controller.placemark = _placemark;
            [self.navigationController pushViewController:controller animated:YES];
        }

        return nil;
    }];
}

- (void)onAddressLocationButtonTapped:(id)sender {

}

- (void)onUserLocationButtonPressed:(id)sender {
    _location = nil;
    [_locationManager startUpdatingLocation];
}

- (void)onRightButtonPressed:(id)sender {
    CUTETicket *currentTicket = [[CUTEDataManager sharedInstance] currentRentTicket];
    if (currentTicket) {
        CUTEProperty *property = [CUTEProperty new];
        property.street = _placemark.street;
        property.latitude = _location.coordinate.latitude;
        property.longitude = _location.coordinate.longitude;
        property.country = _placemark.country;
        property.city = _placemark.city;
        property.zipcode = _placemark.zipcode;
        currentTicket.property = property;

        FXFormViewController *controller = [[FXFormViewController alloc] init];
        controller.formController.form = [CUTEPropertyInfoForm new];
        controller.navigationItem.title = STR(@"房产信息");
        controller.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"预览") style:UIBarButtonItemStylePlain target:nil action:nil];
        [self.navigationController pushViewController:controller animated:YES];
    }
}

- (void)onMapLongPressed:(UIGestureRecognizer *)sender {
    if (sender.state  == UIGestureRecognizerStateBegan) {
        CGPoint touchPoint = [sender locationInView:_mapView];

        CLLocationCoordinate2D touchMapCoordinate = [_mapView convertPoint:touchPoint toCoordinateFromView:_mapView];
        CLLocation *location = [[CLLocation alloc] initWithLatitude:touchMapCoordinate.latitude longitude:touchMapCoordinate.longitude];
          if (!_location || [location distanceFromLocation:_location] > 10) {
              [sender cancelsTouchesInView];
              [self updateLocation:location];
          }
    }
}

- (void)updateLocation:(CLLocation *)location {
    _location = location;
    [_mapView removeAnnotations:_mapView.annotations];
    MKPlacemark *annotation = [[MKPlacemark alloc] initWithCoordinate:_location.coordinate addressDictionary:nil];
    [_mapView addAnnotation:annotation];

    if (!_geocoder) {
        _geocoder = [[CLGeocoder alloc] init];
    }

    [_geocoder reverseGeocodeLocation:_location completionHandler:^(NSArray *placemarks, NSError *error) {
        if (!IsArrayNilOrEmpty(placemarks)) {
            CLPlacemark *placemark = placemarks[0];
            _placemark = [CUTEPlacemark placeMarkWithCLPlaceMark:placemark];
            _textField.text = _placemark.address;
        }
    }];

}

- (void)mapView:(MKMapView *)mapView regionDidChangeAnimated:(__unused BOOL)animated
{
    //update field value
    self.field.value = [[CLLocation alloc] initWithLatitude:mapView.centerCoordinate.latitude
                                                  longitude:mapView.centerCoordinate.longitude];
}

- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray *)locations {
    if (!_location) {
        CLLocation *location = [locations lastObject];
        [self updateLocation:location];
        MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(location.coordinate, 800, 800);
        [_mapView setRegion:[_mapView regionThatFits:region] animated:YES];
    }
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
    [textField endEditing:YES];
}


@end
